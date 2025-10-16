<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'status' => $this->input('status'),
            'company' => $this->input('company'),
            'cep' => $this->input('cep'),
            'address' => $this->input('address'),
            'number' => $this->input('number'),
            'complement' => $this->input('complement'),
            'state' => $this->input('state'),
            'city' => $this->input('city'),
            'district' => $this->input('district'),
            'service' => $this->input('service'),
            'license' => $this->input('license'),
            'occupation' => $this->input('occupation'),
            'validity' => $this->input('validity')
        ]);
    }


    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => false,
            'erros' => $validator->errors(),
        ], 422));
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        $isUpdate = in_array($this->method(), ['PUT', 'PATCH']);

        return [
            'status' => 'sometimes|nullable|string',
            'company' => $isUpdate ? 'required' : 'sometimes',
            'cep' => $isUpdate ? 'sometimes' : 'sometimes',
            'address'  => $isUpdate ? 'sometimes|required' : 'required',
            'state' => $isUpdate ? 'sometimes' : 'sometimes',
            'city' => $isUpdate ? 'sometimes|required' : 'required',
            'service'      => $isUpdate ? 'sometimes|required' : 'required',
            'validity'  => $isUpdate ? 'sometimes|required' : 'required',

            // Campos opcionais no POST
            'number' => 'nullable|string',
            'complement' => 'nullable|string',
            'district' => 'nullable|string',
            'license' => 'nullable|string',
            'occupation' => 'nullable|string',
            'website'    => 'nullable|string',
            'contact'    => 'nullable|string',
            'phone'    => 'nullable|string',
            'cnpj'        => 'nullable|string',
            'email'       => 'nullable|email',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status é obrigatório..',
            'company.required' => 'Nome comercial é obrigatório..',
            'cep.required' => 'CEP é obrigatório..',
            'address.required' => 'Endereço é obrigatório..',
            'state.required' => 'Estado é obrigatório..',
            'city.required' => 'Cidade é obrigatório..',
            'service.required' => 'Tipo de serviço é obrigatório..',
            'validity.required' => 'Data de validade é obrigatória..',

        ];
    }
}
