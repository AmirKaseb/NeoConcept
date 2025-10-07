terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-3"
}

# Security Group
resource "aws_security_group" "neoconcept_sg" {
  name_prefix = "neoconcept-"
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
    Name = "neoconcept-security-group"
  }
}

# EC2 Instance
resource "aws_instance" "neoconcept_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.neoconcept_sg.id]

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

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Create application directory
mkdir -p /opt/neoconcept
cd /opt/neoconcept

# Create docker-compose.yml
cat > docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'

services:
  frontend:
    build: ../frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - neoconcept-network
    restart: unless-stopped

  backend:
    build: ../backend
    # No external port - only accessible via nginx proxy
    environment:
      - NODE_ENV=production
    networks:
      - neoconcept-network
    restart: unless-stopped

networks:
  neoconcept-network:
    driver: bridge
COMPOSE_EOF

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

echo "NeoConcept application deployed successfully!"
echo "Access your application at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
EOF
  )

  tags = {
    Name = "neoconcept-server"
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
