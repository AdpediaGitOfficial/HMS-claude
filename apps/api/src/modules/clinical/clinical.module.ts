import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Encounter } from "./entities/encounter.entity";
import { ClinicalNote } from "./entities/clinical-note.entity";
import { Ward } from "./entities/ward.entity";
import { Bed } from "./entities/bed.entity";
import { Admission } from "./entities/admission.entity";
import { Order } from "./entities/order.entity";
import { AppointmentsController } from "./appointments/appointments.controller";
import { AppointmentsService } from "./appointments/appointments.service";
import { EncountersController } from "./encounters/encounters.controller";
import { EncountersService } from "./encounters/encounters.service";
import { ClinicalNotesController } from "./ehr/clinical-notes.controller";
import { ClinicalNotesService } from "./ehr/clinical-notes.service";
import { BedsController } from "./ipd/beds.controller";
import { BedsService } from "./ipd/beds.service";
import { AdmissionsController } from "./ipd/admissions.controller";
import { AdmissionsService } from "./ipd/admissions.service";
import { OrdersController } from "./orders/orders.controller";
import { OrdersService } from "./orders/orders.service";

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Encounter, ClinicalNote, Ward, Bed, Admission, Order])],
  controllers: [
    AppointmentsController,
    EncountersController,
    ClinicalNotesController,
    BedsController,
    AdmissionsController,
    OrdersController,
  ],
  providers: [
    AppointmentsService,
    EncountersService,
    ClinicalNotesService,
    BedsService,
    AdmissionsService,
    OrdersService,
  ],
  exports: [TypeOrmModule, OrdersService],
})
export class ClinicalModule {}
