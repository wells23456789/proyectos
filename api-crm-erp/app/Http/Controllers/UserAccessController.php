<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Models\Configuration\Sucursale;
use Illuminate\Support\Facades\Storage;

class UserAccessController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize("viewAny",User::class);
        $search = $request->get("search");

        $users = User::where("name","like","%".$search."%")->orderBy("id","desc")->paginate(25);

        return response()->json([
            "total" => $users->total(),
            "users" => $users->map(function($user) {
                return [
                    "id" => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    "surname" => $user->surname,
                    "full_name" => $user->name.' '.$user->surname,
                    "phone" =>  $user->phone,
                    "role_id" => $user->role_id,
                    "role" => $user->role,
                    "roles" => $user->roles,
                    "sucursale_id" => $user->sucursale_id,
                    "sucursale" => $user->sucursale,
                    "type_document" => $user->type_document,
                    "n_document" => $user->n_document,
                    "gender" => $user->gender,
                    "avatar" => $user->avatar ? env("APP_URL")."storage/".$user->avatar : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    "created_format_at" => $user->created_at->format("Y-m-d h:i A"),
                ];
            }),
        ]);
    }

    public function config(){
        return response()->json([
            "roles" => Role::all(), 
            "sucursales" => Sucursale::where("state",1)->get(),
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize("create",User::class);
        $USER_EXITS = User::where("email",$request->email)->first();
        if($USER_EXITS){
            return response()->json([
                "message" => 403,
                "message_text" => "EL USUARIO YA EXISTE"
            ]);
        }

        if($request->hasFile("imagen")){
            $path = Storage::putFile("users",$request->file("imagen"));
            $request->request->add(["avatar" => $path]);
        }

        if($request->password){
            $request->request->add(["password" => bcrypt($request->password)]);
        }

        $role = Role::findOrFail($request->role_id);
        $user = User::create($request->all());
        $user->assignRole($role);
        return response()->json([
            "message" => 200,
            "user" => [
                "id" => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                "surname" => $user->surname,
                "full_name" => $user->name.' '.$user->surname,
                "phone" =>  $user->phone,
                "role_id" => $user->role_id,
                "role" => $user->role,
                "roles" => $user->roles,
                "sucursale_id" => $user->sucursale_id,
                "sucursale" => $user->sucursale,
                "type_document" => $user->type_document,
                "n_document" => $user->n_document,
                "gender" => $user->gender,
                "avatar" => $user->avatar ? env("APP_URL")."storage/".$user->avatar : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                "created_format_at" => $user->created_at->format("Y-m-d h:i A"),
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $this->authorize("update",User::class);
        $USER_EXITS = User::where("email",$request->email)
                        ->where("id","<>",$id)->first();
        if($USER_EXITS){
            return response()->json([
                "message" => 403,
                "message_text" => "EL USUARIO YA EXISTE"
            ]);
        }

        $user = User::findOrFail($id);

        if ($request->hasFile("imagen") && $request->file("imagen")->isValid()) {
            $path = Storage::putFile("users", $request->file("imagen"));
            $request->request->add(["avatar" => $path]);
        } else if ($request->hasFile("imagen")) {
            return response()->json([
                "message" => 422,
                "message_text" => "Error al subir el archivo"
            ], 422);
        }


        if($request->password){
            $request->request->add(["password" => bcrypt($request->password)]);
        }

        if($request->role_id != $user->role_id){
            // EL VIEJO ROL
            $role_old = Role::findOrFail($user->role_id);
            $user->removeRole($role_old);

            // EL NUEVO ROL
            $role = Role::findOrFail($request->role_id);
            $user->assignRole($role);
        }

        $user->update($request->all());
        return response()->json([
            "message" => 200,
            "user" => [
                "id" => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                "surname" => $user->surname,
                "full_name" => $user->name.' '.$user->surname,
                "phone" =>  $user->phone,
                "role_id" => $user->role_id,
                "role" => $user->role,
                "roles" => $user->roles,
                "sucursale_id" => $user->sucursale_id,
                "sucursale" => $user->sucursale,
                "type_document" => $user->type_document,
                "n_document" => $user->n_document,
                "gender" => $user->gender,
                "avatar" => $user->avatar ? env("APP_URL")."storage/".$user->avatar : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                "created_format_at" => $user->created_at->format("Y-m-d h:i A"),
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $this->authorize("delete",User::class);
        $user = User::findOrFail($id);
        if($user->avatar){
            Storage::delete($user->avatar);
        }
        $user->delete();
        return response()->json([
            "message" => 200,
        ]);
    }
}
