import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClientsService } from '../service/clients.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UBIGEO_REGIONES } from 'src/app/config/ubigeo_regiones';
import { UBIGEO_PROVINCIA } from 'src/app/config/ubigeo_provincias';
import { UBIGEO_DISTRITOS } from 'src/app/config/ubigeo_distritos';

@Component({
  selector: 'app-create-clients-person',
  templateUrl: './create-clients-person.component.html',
  styleUrls: ['./create-clients-person.component.scss']
})
export class CreateClientsPersonComponent {

  @Output() ClientsC: EventEmitter<any> = new EventEmitter();

  @Input() client_segments:any = [];
  @Input() asesores:any = [];

  name:string = '';
  surname:string = '';
  client_segment_id:string = '';
  type_document:string = '';
  n_document:number = 0;
  origen:string = '';
  sexo:string = '';
  birthdate:any = null;
  phone:number = 0;
  email:string = '';
  asesor_id:string = '';

  REGIONES:any = UBIGEO_REGIONES;
  PROVINCIAS:any = UBIGEO_PROVINCIA;
  DISTRITOS:any = UBIGEO_DISTRITOS;

  PROVINCIA_SELECTEDS:any  =[];
  DISTRITO_SELECTEDS:any = [];
  tab_selected:number = 1;
  ubigeo_region:string = '';
  ubigeo_provincia:string = '';
  ubigeo_distrito:string = '';
  region:string = '';
  provincia:string = '';
  distrito:string = '';
  address:string = '';
  is_parcial:number = 1;
  isLoading:any;

  constructor(
    public modal: NgbActiveModal,
    public clientsService: ClientsService,
    public toast: ToastrService,
  ) {
    
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

  changeRegion($event:any){
    console.log($event.target.value);
    let REGION_ID = $event.target.value;
    let REGION_SELECTED = this.REGIONES.find((region:any) => region.id == REGION_ID);
    if(REGION_SELECTED){
      this.region = REGION_SELECTED.name;
    }
    let provincias = this.PROVINCIAS.filter((provincia:any) => provincia.department_id == REGION_ID);
    console.log(provincias);
    this.PROVINCIA_SELECTEDS = provincias;
  }
  changeProvincia($event:any){
    console.log($event.target.value);
    let PROVINCIA_ID = $event.target.value;
    let PROVINCIA_SELECTED = this.PROVINCIAS.find((prov:any) => prov.id == PROVINCIA_ID);
    if(PROVINCIA_SELECTED){
      this.provincia = PROVINCIA_SELECTED.name;
    }
    let distritos = this.DISTRITOS.filter((distrito:any) => distrito.province_id == PROVINCIA_ID);
    console.log(distritos);
    this.DISTRITO_SELECTEDS = distritos;
  }
  selectedTab(val:number){
    this.tab_selected = val;
  }
  selectedParcial(){
    this.is_parcial = this.is_parcial == 1 ? 2 : 1;
  }
  store(){
    if(!this.name || !this.surname || !this.client_segment_id || 
      !this.type_document || !this.n_document || !this.origen || 
      !this.sexo || !this.birthdate || !this.phone
      || !this.ubigeo_region || !this.ubigeo_provincia || !this.ubigeo_distrito
      || !this.address
    ){
      this.toast.error("Validación","Necesitas llenar todos los campos con la referencia (*)");
      return false;
    }
    let DISTRITO_SELECTED = this.DISTRITOS.find((distr:any) => distr.id == this.ubigeo_distrito);
    if(DISTRITO_SELECTED){
      this.distrito = DISTRITO_SELECTED.name;
    }
    let data = {
      name: this.name,
      surname: this.surname,
      full_name: this.name + ' ' + this.surname,
      client_segment_id: this.client_segment_id,
      type_document: this.type_document,
      n_document: this.n_document,
      origen: this.origen,
      sexo: this.sexo,
      birthdate: this.birthdate,
      phone: this.phone,
      email: this.email,
      asesor_id: this.asesor_id,
      ubigeo_region: this.ubigeo_region,
      ubigeo_provincia: this.ubigeo_provincia,
      ubigeo_distrito: this.ubigeo_distrito,
      region: this.region,
      provincia:this.provincia,
      distrito: this.distrito,
      address: this.address,
      is_parcial: this.is_parcial,
      type: 1,
    }

    this.clientsService.registerClient(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.toast.error("Validación",resp.message_text);
      }else{
        this.toast.success("Exito","El cliente se registro correctamente");
        this.ClientsC.emit(resp.client);
        this.modal.close();
      }
    })
  }

}
