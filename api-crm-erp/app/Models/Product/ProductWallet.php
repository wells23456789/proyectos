<?php

namespace App\Models\Product;

use Carbon\Carbon;
use App\Models\Configuration\Unit;
use App\Models\Configuration\Sucursale;
use Illuminate\Database\Eloquent\Model;
use App\Models\Configuration\ClientSegment;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductWallet extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        "product_id",
        "unit_id",
        "client_segment_id",
        "sucursale_id",
        "price"
    ];
    public function setCreatedAtAttribute($value) {
        date_default_timezone_set("America/Lima");
        $this->attributes["created_at"] = Carbon::now();
    }
    public function setUpdatedAtAttribute($value) {
        date_default_timezone_set("America/Lima");
        $this->attributes["updated_at"] = Carbon::now();
    }

    public function product(){
        return $this->belongsTo(Product::class,"product_id");
    }

    public function unit(){
        return $this->belongsTo(Unit::class,"unit_id");
    }

    public function client_segment(){
        return $this->belongsTo(ClientSegment::class,"client_segment_id");
    }

    public function sucursale(){
        return $this->belongsTo(Sucursale::class,"sucursale_id");
    }
}
