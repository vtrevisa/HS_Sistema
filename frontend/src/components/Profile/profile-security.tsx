import { useState } from 'react'

import { Eye, EyeOff, Lock } from 'lucide-react'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from '../ui/card'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useUser } from '@/http/use-user'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const changePasswordSchema = z
 .object({
  current_password: z.string().min(1, 'Digite sua senha atual'),
  password: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  password_confirmation: z.string().min(1, 'Confirme a nova senha')
 })
 .refine(data => data.password === data.password_confirmation, {
  path: ['password_confirmation'],
  message: 'As senhas não conferem'
 })

type ChangePasswordData = z.infer<typeof changePasswordSchema>

export function ProfileSecurity() {
 const { updateUserPassword } = useUser()

 const [showCurrentPassword, setShowCurrentPassword] = useState(false)
 const [showNewPassword, setShowNewPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)

 const {
  register,
  handleSubmit,
  formState: { errors },
  reset
 } = useForm<ChangePasswordData>({
  resolver: zodResolver(changePasswordSchema)
 })

 function handleSaveProfileSecurity(data: ChangePasswordData) {
  updateUserPassword.mutate(data, {
   onSuccess: () => {
    reset()
   }
  })
 }

 return (
  <Card>
   <CardHeader>
    <div className="flex items-center gap-3">
     <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
      <Lock className="h-5 w-5 text-primary" />
     </div>
     <div>
      <CardTitle>Alterar Senha</CardTitle>
      <CardDescription>Atualize sua senha de acesso</CardDescription>
     </div>
    </div>
   </CardHeader>
   <CardContent>
    <form
     onSubmit={handleSubmit(handleSaveProfileSecurity)}
     className="space-y-4"
    >
     <div className="space-y-2">
      <Label htmlFor="current-password">Senha Atual</Label>
      <div className="relative">
       <Input
        id="current-password"
        type={showCurrentPassword ? 'text' : 'password'}
        {...register('current_password')}
        className={cn(
         errors.current_password &&
          'focus-visible:ring-red-500 ring-2 ring-red-500 ring-offset-2'
        )}
        placeholder={`${
         errors.current_password ? '' : 'Digite sua senha atual'
        }`}
       />
       <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3"
        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
       >
        {showCurrentPassword ? (
         <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
         <Eye className="h-4 w-4 text-muted-foreground" />
        )}
       </Button>
      </div>
      {errors.current_password && (
       <span className="text-red-500 text-sm">
        {errors.current_password.message}
       </span>
      )}
     </div>
     <div className="space-y-2">
      <Label htmlFor="new-password">Nova Senha</Label>
      <div className="relative">
       <Input
        id="new-password"
        type={showNewPassword ? 'text' : 'password'}
        {...register('password')}
        className={cn(
         errors.password &&
          'focus-visible:ring-red-500 ring-2 ring-red-500 ring-offset-2'
        )}
        placeholder={`${errors.password ? '' : 'Digite a nova senha'}`}
       />
       <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3"
        onClick={() => setShowNewPassword(!showNewPassword)}
       >
        {showNewPassword ? (
         <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
         <Eye className="h-4 w-4 text-muted-foreground" />
        )}
       </Button>
      </div>
      {errors.password && (
       <span className="text-red-500 text-sm">{errors.password.message}</span>
      )}
     </div>

     <div className="space-y-2">
      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
      <div className="relative">
       <Input
        id="confirm-password"
        type={showConfirmPassword ? 'text' : 'password'}
        {...register('password_confirmation')}
        className={cn(
         errors.password_confirmation &&
          'focus-visible:ring-red-500 ring-2 ring-red-500 ring-offset-2'
        )}
        placeholder={`${
         errors.password_confirmation ? '' : 'Confirme a nova senha'
        }`}
       />
       <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
       >
        {showConfirmPassword ? (
         <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
         <Eye className="h-4 w-4 text-muted-foreground" />
        )}
       </Button>
      </div>
      {errors.password_confirmation && (
       <span className="text-red-500 text-sm">
        {errors.password_confirmation.message}
       </span>
      )}
     </div>

     <Button
      type="submit"
      className="w-full"
      disabled={updateUserPassword.isPending}
     >
      {updateUserPassword.isPending ? 'Alterando...' : 'Alterar Senha'}
     </Button>
    </form>
   </CardContent>
  </Card>
 )
}
