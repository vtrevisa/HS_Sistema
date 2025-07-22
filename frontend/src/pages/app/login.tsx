import { LoginForm } from '@/components/Login/login-form'

export function Login() {
 return (
  <div className="bg-login bg-[position:bottom_center] bg-no-repeat bg-cover h-screen w-full flex items-center justify-center">
   <div className="flex items-center justify-center animate-fade-down">
    <LoginForm />
   </div>
  </div>
 )
}
