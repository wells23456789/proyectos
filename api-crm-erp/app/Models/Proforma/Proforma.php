<?php

namespace App\Models\Proforma;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Client\Client;
use App\Models\Configuration\Sucursale;
use Illuminate\Database\Eloquent\Model;
use App\Models\Configuration\ClientSegment;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Proforma extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        "user_id",
        "client_id",
        "client_segment_id",
        "sucursale_id",
        "subtotal",
        "discount",
        "total",
        "igv",
        "state_proforma",
        "state_payment",
        "debt",
        "paid_out",
        "date_validation",
        "date_pay_complete",
        "description",
        "state_despacho",

        "state_despacho",
        "date_entrega",
        // 
        // "created_at",
        // "updated_at"
    ];
    
    public function setCreatedAtAttribute($value) {
        date_default_timezone_set("America/Lima");
        $this->attributes["created_at"] = Carbon::now();
    }
    public function setUpdatedAtAttribute($value) {
        date_default_timezone_set("America/Lima");
        $this->attributes["updated_at"] = Carbon::now();
    }

    public function asesor(){
        return $this->belongsTo(User::class,"user_id");
    }

    public function client(){
        return $this->belongsTo(Client::class,"client_id");
    }

    public function sucursale(){
        return $this->belongsTo(Sucursale::class,"sucursale_id");
    }

    public function client_segment(){
        return $this->belongsTo(ClientSegment::class,"client_segment_id");
    }

    public function details(){
        return $this->hasMany(ProformaDetail::class,"proforma_id");
    }

    public function entregados(){
        return $this->hasMany(ProformaDetail::class,"proforma_id")->where("date_entrega","<>",NULL);
    }

    public function proforma_deliverie() {
        return $this->hasOne(ProformaDeliverie::class,"proforma_id");
    }

    public function proforma_payments() {
        return $this->hasMany(ProformaPayment::class,"proforma_id");
    }

    public function getFirstPayment(){
        return $this->proforma_payments->first();
    }

    public function scopeFilterAdvance($query,$search,$client_segment_id,$asesor_id,
    $product_categorie_id,$search_client,$search_product,
    $start_date,$end_date,$state_proforma,$user = null){
        if($search){
            $query->where("id",$search);
        }
        if($client_segment_id){
            $query->where("client_segment_id",$client_segment_id);
        }
        if($asesor_id){
            $query->where("user_id",$asesor_id);
        }
        if($product_categorie_id){
            $query->whereHas("details",function($q) use($product_categorie_id){
                $q->where("product_categorie_id",$product_categorie_id);
            });
        }
        if($search_client){
            $query->whereHas("client",function($q) use($search_client){
                $q->where("full_name","like","%".$search_client."%");
            });
        }
        if($search_product){
            $query->whereHas("details",function($q) use($search_product){
                $q->whereHas("product",function($subq) use($search_product){
                    $subq->where("title","like","%".$search_product."%");
                });
            });
        }
        if($start_date && $end_date){
            $query->whereBetween("created_at",[
                Carbon::parse($start_date)->format("Y-m-d")." 00:00:00",
                Carbon::parse($end_date)->format("Y-m-d")." 23:59:59"
            ]);
        }
        if($state_proforma){
            $query->where("state_proforma",$state_proforma);
        }
        if($user && $user->role_id != 1){
            if($user->role_id == 2){
                $query->where("user_id",$user->id);
            }else{
                $query->whereHas("proforma_deliverie",function($q) use($user){
                    // $q->where("sucursale_deliverie_id",$user->sucursale_id);
                    $q->whereHas("sucursal_deliverie",function($subq) use($user){
                        $subq->where("sucursale_id",$user->sucursale_id);
                    });
                });
            }
        }
        return $query;
    }

    public function scopeFilterShort($query,$n_proforma,$state_payment){
        if($n_proforma){
            $query->where("id",$n_proforma);
        }
        if($state_payment){
            $query->where("state_payment",$state_payment);
        }
        return $query;
    }

    public function scopeFilterCronograma($query,$search_client,$categorie_id,$segment_client_id,$status_pay,$user = null){
        
        if($search_client){
            $query->whereHas("client",function($subq) use($search_client){
                $subq->where("full_name","like","%".$search_client."%");
            });
        }
        if($categorie_id){
            $query->whereHas("details",function($subq) use($categorie_id){
                $subq->where("product_categorie_id",$categorie_id);
            });
        }
        if($segment_client_id){
            $query->where("client_segment_id",$segment_client_id);
        }
        if($status_pay){
            $query->where("state_payment",$status_pay);
        }
        if($user && $user->role_id != 1){
            if($user->role_id == 2){
                $query->where("user_id",$user->id);
            }else{
                $query->whereHas("proforma_deliverie",function($q) use($user){
                    // $q->where("sucursale_deliverie_id",$user->sucursale_id);
                    $q->whereHas("sucursal_deliverie",function($subq) use($user){
                        $subq->where("sucursale_id",$user->sucursale_id);
                    });
                });
            }
        }
        return $query;
    }
}
