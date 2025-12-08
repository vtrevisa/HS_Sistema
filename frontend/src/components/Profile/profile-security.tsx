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

export function ProfileSecurity() {
 const [currentPassword, setCurrentPassword] = useState('')
 const [newPassword, setNewPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showCurrentPassword, setShowCurrentPassword] = useState(false)
 const [showNewPassword, setShowNewPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)

 const [isLoading, setIsLoading] = useState(false)

 function handleSaveProfileSecurity() {
  setIsLoading(true)
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
    <form onSubmit={handleSaveProfileSecurity} className="space-y-4">
     <div className="space-y-2">
      <Label htmlFor="current-password">Senha Atual</Label>
      <div className="relative">
       <Input
        id="current-password"
        type={showCurrentPassword ? 'text' : 'password'}
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
        placeholder="Digite sua senha atual"
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
     </div>
     <div className="space-y-2">
      <Label htmlFor="new-password">Nova Senha</Label>
      <div className="relative">
       <Input
        id="new-password"
        type={showNewPassword ? 'text' : 'password'}
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        placeholder="Digite a nova senha"
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
     </div>

     <div className="space-y-2">
      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
      <div className="relative">
       <Input
        id="confirm-password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        placeholder="Confirme a nova senha"
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
     </div>

     <Button
      type="submit"
      className="w-full"
      disabled={!currentPassword || isLoading}
     >
      {isLoading ? 'Alterando...' : 'Alterar Senha'}
     </Button>
    </form>
   </CardContent>
  </Card>
 )
}
