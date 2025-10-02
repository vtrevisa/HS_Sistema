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
            'erros' => $validator->errors(),
        ], 422));
    }



    public function rules(): array
    {
        $isUpdate = in_array($this->method(), ['PUT', 'PATCH']);

        $leadId = $this->route('lead');

        return [
            'company' => 'nullable|string',
            'service'      => $isUpdate ? 'sometimes|required' : 'required',
            'license'   => 'required|string|unique:leads,license,' . ($leadId ? $leadId->id : null),
            'validity'  => $isUpdate ? 'sometimes|required' : 'required',
            'address'  => $isUpdate ? 'sometimes|required' : 'required',
            'number'    => $isUpdate ? 'sometimes|required' : 'required',
            'city' => $isUpdate ? 'sometimes|required' : 'required',
            'district'    => $isUpdate ? 'sometimes|required' : 'required',
            'occupation'  => $isUpdate ? 'sometimes|required' : 'required',
            'expiration_date' => $isUpdate ? 'sometimes|required' : 'required',
            'next_action' => 'sometimes|nullable|string',

            // Campos opcionais no POST
            'cep' => 'nullable|string',
            'complement' => 'nullable|string',
            'cnpj'        => 'nullable|string',
            'website'        => 'nullable|string',
            'contact'     => 'nullable|string',
            'phone'    => 'nullable|string',
            'email'       => 'nullable|email',
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

        ];
    }
}
