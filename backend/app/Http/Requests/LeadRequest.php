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


    protected function prepareForValidation()
    {
        $this->merge([
            'company' => $this->input('company') ?? $this->input('company'),
            'service' => $this->input('service') ?? $this->input('type'),
            'license' => $this->input('license') ?? $this->input('license'),
            'validity' => $this->input('validity') ?? $this->input('vigencia'),
            'address' => $this->input('address') ?? $this->input('address'),
            'occupation' => $this->input('occupation') ?? $this->input('occupation'),
            'number' => $this->input('number'),
            'city' => $this->input('city') ?? $this->input('municipio'),
            'district' => $this->input('district') ?? $this->input('bairro'),
            'cep' => $this->input('cep'),
            'complement' => $this->input('complement'),
            'expiration_date' => $this->input('expiration_date'),
            'next_action' => $this->input('next_action') ?? $this->input('nextAction'),
        ]);
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => false,
            'errors' => $validator->errors(),
        ], 422));
    }



    public function rules(): array
    {
        $isUpdate = in_array($this->method(), ['PUT', 'PATCH']);
        $leadId = $this->route('lead')?->id ?? null;

        return [
            'company' => $isUpdate ? 'nullable|string' : 'required|string',
            'service' => $isUpdate ? 'nullable|string' : 'required|string',
            'license' => $isUpdate
                ? 'nullable|string|unique:leads,license,' . $leadId
                : 'required|string|unique:leads,license',
            'validity' => $isUpdate ? 'nullable|date' : 'required|date',
            'address' => $isUpdate ? 'nullable|string' : 'required|string',
            'number' => $isUpdate ? 'nullable|string' : 'required|string',
            'city' => $isUpdate ? 'nullable|string' : 'required|string',
            'district' => $isUpdate ? 'nullable|string' : 'required|string',
            'occupation' => $isUpdate ? 'nullable|string' : 'required|string',
            'expiration_date' => $isUpdate ? 'nullable|date' : 'required|date',
            'next_action' => 'sometimes|nullable|string',

            // Campos opcionais no POST
            'cep' => 'nullable|string',
            'complement' => 'nullable|string',
            'cnpj' => 'nullable|string',
            'website' => 'nullable|string',
            'contact' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ];
    }

    public function messages(): array
    {
        return [
            'service.required' => 'Tipo é obrigatório..',
            'license.required' => 'Licença é obrigatório..',
            'license.string' => 'Necessário licença válida..',
            'license.unique' => 'Está licença já está cadastrada..',
            'validity.required' => 'Vigência é obrigatória..',
            'address.required' => 'Endereço é obrigatório..',
            'number.required' => 'Número é obrigatório..',
            'city.required' => 'Município é obrigatório..',
            'district.required' => 'Bairro é obrigatório..',
            'occupation.required' => 'Ocupação é obrigatório..',
            'expiration_date.required' => 'Data de expiração é obrigatória.',

        ];
    }
}
