<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ArchivedProposalRequest extends FormRequest
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
            'lead_id' => $this->input('lead_id'),
            'company' => $this->input('company'),
            'type' => $this->input('type'),
            'value' => $this->input('value'),
            'status' => $this->input('status'),
            'reason' => $this->input('reason'),
        ]);
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => false,
            'errors' => $validator->errors(),
        ], 422));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'lead_id' => 'required|exists:leads,id',
            'company' => 'nullable|string',
            'type' => 'nullable|string',
            'value' => 'nullable|numeric',
            'status' => 'required|in:Ganho,Perdido',
            'reason' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'lead_id.required' => 'O ID do lead é obrigatório.',
            'lead_id.exists' => 'O lead informado não foi encontrado.',

            'status.required' => 'O status é obrigatório.',
            'status.in' => 'O status deve ser "Ganho" ou "Perdido".',
        ];
    }
}
