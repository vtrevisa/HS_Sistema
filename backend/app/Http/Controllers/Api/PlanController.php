<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;


class PlanController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => true,
            'plans' => Plan::all()
        ]);
    }
}
