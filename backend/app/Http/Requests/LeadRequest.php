<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class LeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => false,
            'erros' => $validator->errors(),
        ], 422));
    }



    public function rules(): array
    {
        $isUpdate = in_array($this->method(), ['PUT', 'PATCH']);

        $leadId = $this->route('lead');

        return [
            'empresa' => 'nullable|string',
            'tipo'      => $isUpdate ? 'sometimes|required' : 'required',
            'licenca'   => 'required|string|unique:leads,licenca,' . ($leadId ? $leadId->id : null),
            'vigencia'  => $isUpdate ? 'sometimes|required' : 'required',
            'endereco'  => $isUpdate ? 'sometimes|required' : 'required',
            'numero'    => $isUpdate ? 'sometimes|required' : 'required',
            'municipio' => $isUpdate ? 'sometimes|required' : 'required',
            'bairro'    => $isUpdate ? 'sometimes|required' : 'required',
            'ocupacao'  => $isUpdate ? 'sometimes|required' : 'required',

            // Campos opcionais no POST e obrigatórios no UPDATE
            // 'complemento' => $isUpdate ? 'required|string' : 'nullable|string',
            // 'cnpj'        => $isUpdate ? 'required|string' : 'nullable|string',
            // 'site'        => $isUpdate ? 'required|string' : 'nullable|string',
            // 'contato'     => $isUpdate ? 'required|string' : 'nullable|string',
            // 'whatsapp'    => $isUpdate ? 'required|string' : 'nullable|string',
            // 'email'       => $isUpdate ? 'required|email' : 'nullable|email',

            // 'tipo'      => 'required',
            // 'licenca'   => 'required|string|unique:leads,licenca',
            // 'vigencia'  => 'required',
            // 'endereco'  => 'required',
            // 'numero'    => 'required',
            // 'municipio' => 'required',
            // 'bairro'    => 'required',
            // 'ocupacao'  => 'required',

            // Campos opcionais no POST
            'complemento' => 'nullable|string',
            'cnpj'        => 'nullable|string',
            'site'        => 'nullable|string',
            'contato'     => 'nullable|string',
            'whatsapp'    => 'nullable|string',
            'email'       => 'nullable|email',
        ];
    }

    public function messages(): array
    {
        return [
            'tipo.required' => 'Tipo é obrigatório!',
            'licenca.required' => 'Licença é obrigatório!',
            'licenca.string' => 'Necessário licença válida!',
            'licenca.unique' => 'Está licença já está cadastrada!',
            'vigencia.required' => 'Vigência é obrigatória!',
            'endereco.required' => 'Endereço é obrigatório!',
            'numero.required' => 'Número é obrigatório!',
            'municipio.required' => 'Município é obrigatório!',
            'bairro.required' => 'Bairro é obrigatório!',
            'ocupacao.required' => 'Ocupação é obrigatório!',

        ];
    }
}
