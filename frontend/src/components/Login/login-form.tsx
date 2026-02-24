import { useEffect, useState } from 'react'
import { LockKeyhole, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/http/use-auth'
import { Loading } from './loading'

import logo from '@/assets/avcb-logo-vertical.png'

const loginSchema = z.object({
 login: z.string().min(1, 'Informe o usuário ou e-mail'),
 password: z
  .string()
  .min(1, 'Informe a senha')
  .min(6, 'A senha deve ter pelo menos 6 caracteres')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
 const savedLogin =
  typeof window !== 'undefined' ? localStorage.getItem('remember_login') : null

 const {
  register,
  handleSubmit,
  setValue,
  watch,
  formState: { errors }
 } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
   login: savedLogin || ''
  }
 })

 const { mutateAsync: auth, isPending } = useAuth()

 const [checked, setChecked] = useState(!!savedLogin)

 const loginValue = watch('login')

 async function handleLogin(data: LoginFormData) {
  await auth(data)

  if (checked) {
   localStorage.setItem('remember_login', data.login)
  } else {
   localStorage.removeItem('remember_login')
  }
 }

 useEffect(() => {
  if (checked) {
   localStorage.setItem('remember_login', loginValue || '')
  } else {
   localStorage.removeItem('remember_login')
  }
 }, [checked, loginValue])

 useEffect(() => {
  const savedLogin = localStorage.getItem('remember_login')
  if (savedLogin) {
   setValue('login', savedLogin)
   setChecked(true)
  }
 }, [setValue])

 return (
  <form onSubmit={handleSubmit(handleLogin)}>
   <img src={logo} alt="AVCB CERTO Logo" className="pb-12 w-72" />
   <div className="flex flex-col gap-4">
    <div className="relative">
     <User className="absolute left-3 top-3 h-5 w-5 text-stone-900" />
     <label htmlFor="username" className="sr-only">
      Usuário ou E-mail
     </label>
     <input
      type="text"
      {...register('login')}
      id="login"
      name="login"
      autoComplete="login"
      placeholder="Usuário ou E-mail"
      className="pl-10 py-2 w-full border-2 rounded border-red-1000 placeholder:text-stone-900 placeholder:text-sm placeholder:font-semibold text-stone-900 text-base font-normal focus:outline-none"
     />
     {errors.login && (
      <p className="text-red-1000 text-sm">{errors.login.message}</p>
     )}
    </div>
    <div className="relative">
     <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-stone-900" />
     <label htmlFor="password" className="sr-only">
      Senha
     </label>
     <input
      type="password"
      {...register('password')}
      id="password"
      name="password"
      autoComplete="current-password"
      placeholder="Senha"
      className="pl-10 py-2 w-full border-2 rounded border-red-1000 placeholder:text-stone-900 placeholder:text-sm placeholder:font-semibold text-stone-900 text-base font-normal focus:outline-none"
     />
     {errors.password && (
      <p className="text-red-1000 text-sm">{errors.password.message}</p>
     )}
    </div>
    <div className="flex flex-col gap-4 justify-center items-center">
     <input
      type="checkbox"
      id="remember"
      name="remember"
      checked={checked}
      onChange={() => setChecked(!checked)}
      className="sr-only"
     />
     <label
      htmlFor="remember"
      className="flex gap-2 items-center cursor-pointer"
     >
      <div
       aria-hidden="true"
       className="w-5 h-5 border-2 border-red-1000 rounded flex items-center justify-center"
      >
       {checked && <span className="text-red-1000 font-bold text-sm">✓</span>}
      </div>
      <span className="text-stone-900 text-sm font-semibold">
       Salvar meus Dados
      </span>
     </label>
     <button
      type="submit"
      disabled={isPending}
      className="bg-red-1000 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-base font-extrabold uppercase p-2 w-44 focus:outline-none"
     >
      {isPending ? <Loading size={22} /> : 'Login'}
     </button>
     <a
      href="#forgotpassword"
      className="text-red-1000 text-sm font-semibold underline focus:outline-none"
     >
      Esqueci minha senha
     </a>
    </div>
   </div>
  </form>
 )
}
