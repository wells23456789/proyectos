import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransportsService } from '../service/transports.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchProductsComponent } from '../../proformas/componets/search-products/search-products.component';
import { EditDetailTransportsComponent } from '../components/edit-detail-transports/edit-detail-transports.component';
import { DeleteDetailTransportsComponent } from '../components/delete-detail-transports/delete-detail-transports.component';

@Component({
  selector: 'app-edit-transports',
  templateUrl: './edit-transports.component.html',
  styleUrls: ['./edit-transports.component.scss']
})
export class EditTransportsComponent {

  full_name_user:string = '';
  sucursal_user:string = '';
  warehouse_start_id:string = '';
  warehouse_end_id:string = '';

  date_emision:any = null;
  type_comprobant:string = '';
  n_comprobant:string = '';
  description:string = '';

  // DETALLADO DE LA COMPRA
  search_product:string = '';
  unit_id:string = '';
  price_unit:number = 0;
  quantity:number = 0;

  importe:number = 0; 
  igv:number = 0;
  total:number = 0;

  user:any;

  warehouses_start:any = [];
  warehouses_end:any = [];
  units:any = [];
  state:string = '1';

  isLoading$:any;
  PRODUCT_SELECTED:any;
  TRANSPORTS_DETAILS:any = [];
  TRANSPORT_ID:string = '';
  TRANSPORT_SELECTED:any = null;
  constructor(
    public transportService: TransportsService,
    public toast: ToastrService,
    public modalService: NgbModal,
    public activedRoute: ActivatedRoute,
  ) {
    
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.activedRoute.params.subscribe((resp:any) => {
      this.TRANSPORT_ID = resp.id;
    })
    this.user = this.transportService.authservice.user;
    // this.full_name_user = this.user.full_name;
    // this.sucursal_user = this.user.sucursale_name;
    this.showTransport();
    this.isLoading$ = this.transportService.isLoading$;
  }
  showTransport(){
    this.transportService.showTransport(this.TRANSPORT_ID).subscribe((resp:any) => {
      console.log(resp);
      this.TRANSPORT_SELECTED = resp.transport;
      this.full_name_user = this.TRANSPORT_SELECTED.user.full_name;
      this.sucursal_user = this.TRANSPORT_SELECTED.user.sucursale.name;

      this.warehouse_start_id = this.TRANSPORT_SELECTED.warehouse_start_id;
      this.warehouse_end_id = this.TRANSPORT_SELECTED.warehouse_end_id;
      this.date_emision = this.TRANSPORT_SELECTED.date_emision
      this.description = this.TRANSPORT_SELECTED.description;
      this.state = this.TRANSPORT_SELECTED.state;
      this.TRANSPORTS_DETAILS = this.TRANSPORT_SELECTED.details;
      this.total = this.TRANSPORT_SELECTED.total; 
      this.importe = this.TRANSPORT_SELECTED.importe; 
      this.igv =this.TRANSPORT_SELECTED.igv; 
      if(this.warehouses_start.length == 0){
        this.configAll();
      }
    });
  }
  configAll(){
    this.transportService.configAll().subscribe((resp:any) => {
      this.warehouses_start = resp.warehouses;
      this.warehouses_end = resp.warehouses;
      // this.units = resp.units;
      // this.date_emision = resp.now;
    })
  }

  isLoadingProcess(){
    this.transportService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.transportService.isLoadingSubject.next(false);
    }, 50);
  }

  listProducts(){
    if(!this.search_product){
      this.toast.error("Validación","Necesitas ingresar al menos uno de los campos");
      return;
    }
    if(!this.warehouse_start_id){
      this.toast.error("Validacion","Se necesita seleccionar un almacen de atención");
      return;
    }
    this.transportService.searchProducts(this.search_product).subscribe((resp:any) => {
      console.log(resp);
      if(resp.products.data.length > 1){
        this.openSelectedProduct(resp.products.data);
      }else{
        if(resp.products.data.length == 1){
          this.PRODUCT_SELECTED = resp.products.data[0];
          this.search_product = this.PRODUCT_SELECTED.title;
          this.units = this.PRODUCT_SELECTED.warehouses.filter((warehouse:any) => warehouse.warehouse.id == this.warehouse_start_id);
          this.toast.success("Exito","Se selecciono el producto ");
          this.isLoadingProcess();
        }else{
          this.toast.error("Validación","No hay coincidencia en la busqueda");
        }
      }
    })
  }

  openSelectedProduct(products:any = []){
    const modalRef = this.modalService.open(SearchProductsComponent,{size:'lg',centered: true});
    modalRef.componentInstance.products = products

    modalRef.componentInstance.ProductSelected.subscribe((product:any) => {
      this.PRODUCT_SELECTED = product;
      this.search_product = this.PRODUCT_SELECTED.title;
      this.units = this.PRODUCT_SELECTED.warehouses.filter((warehouse:any) => warehouse.warehouse.id == this.warehouse_start_id);
      this.isLoadingProcess();
      this.toast.success("Exito","Se selecciono el producto");
    })
  }
  updatedUnit(){
    if(this.PRODUCT_SELECTED){
      this.units = this.PRODUCT_SELECTED.warehouses.filter((warehouse:any) => warehouse.warehouse.id == this.warehouse_start_id);
    }
  }
  addDetail(){
    if(!this.PRODUCT_SELECTED){
      this.toast.error("Validacion","Se necesita seleccionar un producto");
      return;
    }
    if(!this.unit_id){
      this.toast.error("Validacion","Se necesita seleccionar una unidad");
      return;
    }

    // if(!this.price_unit){
    //   this.toast.error("Validacion","Se necesita digitar un precio");
    //   return;
    // }

    if(!this.quantity){
      this.toast.error("Validacion","Se necesita digitar una cantidad");
      return;
    }
    
    let UNIDAD_SELECTED = this.units.find((unit:any) => unit.unit.id == this.unit_id)
    if(UNIDAD_SELECTED && UNIDAD_SELECTED.quantity < this.quantity){
      this.toast.error("Validacion","No puedes solicitar esa cantidad, porque no hay stock disponible ("+UNIDAD_SELECTED.quantity+")");
      return;
    }
    let NUEVO_IMPORTE = Number( (this.importe + Number((this.price_unit*this.quantity).toFixed(2))).toFixed(2));
    let NUEVO_IGV = Number((NUEVO_IMPORTE*0.18).toFixed(2));

    this.transportService.addTransportDetail({
      product: this.PRODUCT_SELECTED,
      unit: UNIDAD_SELECTED.unit,
      price_unit: this.price_unit,
      quantity: this.quantity,
      total: Number((this.price_unit*this.quantity).toFixed(2)),
      total_purchase: NUEVO_IMPORTE + NUEVO_IGV,
      importe: NUEVO_IMPORTE,
      igv: NUEVO_IGV,
      transport_id: this.TRANSPORT_ID,
    }).subscribe((resp:any) => {
      console.log(resp);
      this.TRANSPORTS_DETAILS.push(resp.transport_detail);
      this.PRODUCT_SELECTED = null;
      this.unit_id = '';
      this.price_unit = 0;
      this.quantity = 0;
      this.search_product = '';
      this.units = [];

      this.total = resp.total;
      this.importe = resp.importe;
      this.igv = resp.igv;
    })

  }

  calcTotalPurchase(){
    this.importe = Number(this.TRANSPORTS_DETAILS.reduce((sum:number,item:any) => sum+ item.total,0).toFixed(2));
    this.igv = Number((this.importe*0.18).toFixed(2));
    this.total = Number((this.importe + this.igv).toFixed(2));
    this.isLoadingProcess();
  }

  editItemTransport(index:number,detail:any){
    const modalRef = this.modalService.open(EditDetailTransportsComponent,{centered: true,size:'md'});
    modalRef.componentInstance.detail_transport = detail;
    // modalRef.componentInstance.units = this.units;
    modalRef.componentInstance.warehouse_start_id = this.warehouse_start_id;
    modalRef.componentInstance.index = index;
    modalRef.componentInstance.importe = this.importe;
    modalRef.componentInstance.is_edit = 1;

    modalRef.componentInstance.EditItemTranport.subscribe((resp:any) => {
      this.TRANSPORTS_DETAILS[index] = resp.transport_detail;
      this.total = resp.total;
      this.importe = resp.importe;
      this.igv = resp.igv;
      this.isLoadingProcess();
    })
  }

  deleteItemTransport(index:number,detail:any){
    const modalRef = this.modalService.open(DeleteDetailTransportsComponent,{centered: true,size:'md'});
    modalRef.componentInstance.detail_transport = detail;
    modalRef.componentInstance.importe = this.importe;
    modalRef.componentInstance.index = index;
    modalRef.componentInstance.is_edit = 1;
    modalRef.componentInstance.transport_id = this.TRANSPORT_ID;

    modalRef.componentInstance.DeleteItemTransport.subscribe((resp:any) => {
      this.TRANSPORTS_DETAILS.splice(index,1);
      this.importe  = resp.importe;
      this.total = resp.total;
      this.igv = resp.igv;
      this.isLoadingProcess();
    })
  }

  editOrderTransport(){

    if(!this.warehouse_start_id){
      this.toast.error("Validacion","Necesitas seleccionar un almacen de origen");
      return;
    }

    if(!this.warehouse_end_id){
      this.toast.error("Validacion","Necesitas seleccionar un almacen de llegada");
      return;
    }

    if(this.TRANSPORTS_DETAILS.length == 0){
      this.toast.error("Validacion","Necesitas agregar al menos un producto al detallado");
      return;
    }
    let data = {
      warehouse_start_id: this.warehouse_start_id,
      warehouse_end_id: this.warehouse_end_id,
      date_emision: this.date_emision,
      description: this.description,
      state: this.state,
    }

    this.transportService.editTransport(this.TRANSPORT_ID,data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.toast.error("Validación",resp.message_text);
      }else{
        this.toast.success("Exito","La solicitud de transporte se ha editado correctamente");
        this.showTransport();
      }
    },error => {
      console.log(error);
      this.toast.error("ERROR","Hubo un problema en el servidor con tu orden, comunicate con soporte");
    })
  }
  
}
