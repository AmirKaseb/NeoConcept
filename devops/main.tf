terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  
  # Use a simple local state for now, but with unique resource names
  # In production, you'd want S3 backend for state persistence
}

provider "aws" {
  region = "eu-west-3"
}

# Random string for unique resource names
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# IAM role for EC2 instance
resource "aws_iam_role" "ec2_role" {
  name = "neoconcept-ec2-role-${random_string.suffix.result}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach SSM policy to the role
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "neoconcept-ec2-profile-${random_string.suffix.result}"
  role = aws_iam_role.ec2_role.name
}

# Security Group
resource "aws_security_group" "neoconcept_sg" {
  name        = "neoconcept-sg-${random_string.suffix.result}"
  description = "Security group for NeoConcept application"

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "neoconcept-security-group-${random_string.suffix.result}"
  }
}

# EC2 Instance
resource "aws_instance" "neoconcept_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.neoconcept_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = base64encode(<<-EOF
#!/bin/bash

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS SSM Agent
snap install amazon-ssm-agent --classic

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Create application directory
mkdir -p /opt/neoconcept
cd /opt/neoconcept

# Create directories for app code
mkdir -p frontend backend

# Create optimized docker-compose.yml
cat > docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'

services:
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - neoconcept-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    networks:
      - neoconcept-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('net').connect(9595, 'localhost', () => process.exit(0)).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  neoconcept-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.enable_icc: "true"
      com.docker.network.bridge.enable_ip_masquerade: "true"
COMPOSE_EOF

# Download application code from GitHub
echo "Downloading application code..."
git clone https://github.com/$GITHUB_REPOSITORY.git /tmp/app-source || echo "Failed to clone repo"
cp -r /tmp/app-source/frontend/* ./frontend/ 2>/dev/null || echo "No frontend code"
cp -r /tmp/app-source/backend/* ./backend/ 2>/dev/null || echo "No backend code"

# Create startup script
cat > start.sh << 'START_EOF'
#!/bin/bash
cd /opt/neoconcept
docker-compose down
docker-compose up --build -d
START_EOF

chmod +x start.sh

# Start the application
./start.sh

# Create systemd service for auto-start
cat > /etc/systemd/system/neoconcept.service << 'SERVICE_EOF'
[Unit]
Description=NeoConcept Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/neoconcept
ExecStart=/opt/neoconcept/start.sh
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Enable and start the service
systemctl daemon-reload
systemctl enable neoconcept.service
systemctl start neoconcept.service

# Install fail2ban for security
apt-get install -y fail2ban

# Configure fail2ban for SSH
cat > /etc/fail2ban/jail.local << 'FAIL2BAN_EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
FAIL2BAN_EOF

systemctl enable fail2ban
systemctl start fail2ban

# Simple auto-shutdown after 1 hour
echo "shutdown -h +60" | at now

echo "NeoConcept application deployed successfully!"
echo "Access your application at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "Server will automatically shut down in 1 hour"
EOF
  )

  tags = {
    Name = "neoconcept-server-${random_string.suffix.result}"
  }
}

# Get latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Outputs
output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.neoconcept_server.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.neoconcept_server.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.neoconcept_server.public_dns
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${aws_instance.neoconcept_server.public_ip}"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "No SSH key configured - use AWS Systems Manager Session Manager"
}
