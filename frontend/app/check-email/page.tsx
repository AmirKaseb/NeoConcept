// app/check-email/page.tsx
export default function CheckEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-3 text-gray-800">
          Check your email 📧
        </h1>
        <p className="text-gray-600">
          We’ve sent you a confirmation link. Please check your inbox to verify your account.
        </p>
      </div>
    </div>
  );
}
