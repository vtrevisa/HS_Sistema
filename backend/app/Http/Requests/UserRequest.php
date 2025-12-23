<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => false,
            'erros' => $validator->errors(),
        ], 422));
    }

    public function rules(): array
    {
        $userId = optional($this->route('user'))->id;

        // CREATE (POST)
        if ($this->isMethod('post')) {
            return [
                'name'     => 'required|string',
                'email'    => 'required|email|unique:users,email',
                'password' => 'required|min:6',
                'role'     => 'nullable|in:admin,user',
                'status' => 'nullable|in:active,inactive,pending,blocked',

                'cnpj'     => 'nullable|string',
                'company'  => 'nullable|string',
                'phone'    => 'nullable|string',
                'address'  => 'nullable|string',
            ];
        }

        // UPDATE (PUT / PATCH)
        return [
            'name'     => 'sometimes|required|string',
            'email'    => 'sometimes|required|email|unique:users,email,' . $userId,
            'password' => 'sometimes|nullable|min:6',
            'role'     => 'sometimes|in:admin,user',
            'status' => 'nullable|in:active,inactive,pending,blocked',

            'cnpj'     => 'nullable|string',
            'company'  => 'nullable|string',
            'phone'    => 'nullable|string',
            'address'  => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nome é obrigatório!',
            'email.email' => 'Necessário endereço de e-mail válido!',
            'email.unique' => 'O e-mail já está cadastrado!',
            'password.min' => 'Senha com no mínimo :min caracteres!',
        ];
    }
}
