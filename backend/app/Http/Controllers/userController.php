<?php

namespace App\Http\Controllers;

use App\Models\User;
use GuzzleHttp\Psr7\Response;
use Illuminate\Http\Request;

class userController extends Controller
{
    function getUser(Request $req){
        $user=User::first();
        return response()->json($user);
    }
    function checkUser(Request $req){
        $name=$req->name;
        $pass=$req->password;
        $user=User::where('name',$name)->where('password',$pass)->first();
        if(is_null($user)){
            return response()->json(["message"=>"user is not exist","accept"=>false]);
        }
        return response()->json(["message"=>"user is not exist","accept"=>true]);
    }
}
