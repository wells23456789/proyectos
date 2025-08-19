<?php

namespace App\Models\Kardex;

use Carbon\Carbon;
use App\Models\Product\Product;
use App\Models\Configuration\Unit;
use App\Models\Configuration\Warehouse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductStockInitial extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        "product_id",
        "price_unit_avg",
        "unit_id",
        "warehouse_id",
        "stock"
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

    public function warehouse(){
        return $this->belongsTo(Warehouse::class,"warehouse_id");
    }
}
