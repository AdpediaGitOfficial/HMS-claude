import { BadRequestException, Injectable } from "@nestjs/common";
import { Ambulance } from "../entities/ambulance.entity";
import { AmbulanceTrip } from "../entities/ambulance-trip.entity";
import { AddAmbulanceDto, DispatchAmbulanceDto } from "../dto/ambulance.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class AmbulanceService {
  async listFleet(): Promise<Ambulance[]> {
    return tenantManager().getRepository(Ambulance).find({ order: { vehicleNumber: "ASC" } });
  }

  async listTrips(): Promise<AmbulanceTrip[]> {
    return tenantManager().getRepository(AmbulanceTrip).find({ order: { dispatchedAt: "DESC" } });
  }

  async addVehicle(dto: AddAmbulanceDto): Promise<Ambulance> {
    const repo = tenantManager().getRepository(Ambulance);
    const vehicle = repo.create({
      ...dto,
      status: "available",
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(vehicle);
  }

  async dispatch(dto: DispatchAmbulanceDto): Promise<AmbulanceTrip> {
    const ambRepo = tenantManager().getRepository(Ambulance);
    const ambulance = await ambRepo.findOneOrFail({ where: { id: dto.ambulanceId } });
    if (ambulance.status !== "available") {
      throw new BadRequestException(`Ambulance ${ambulance.vehicleNumber} is not available (${ambulance.status})`);
    }

    const tripRepo = tenantManager().getRepository(AmbulanceTrip);
    const trip = tripRepo.create({
      ...dto,
      dispatchedAt: new Date(),
      status: "dispatched",
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    const saved = await tripRepo.save(trip);

    ambulance.status = "on_trip";
    ambulance.updatedBy = currentUserId();
    await ambRepo.save(ambulance);

    return saved;
  }

  async complete(tripId: string): Promise<AmbulanceTrip> {
    const tripRepo = tenantManager().getRepository(AmbulanceTrip);
    const trip = await tripRepo.findOneOrFail({ where: { id: tripId } });
    trip.status = "completed";
    trip.completedAt = new Date();
    trip.updatedBy = currentUserId();
    const saved = await tripRepo.save(trip);

    const ambRepo = tenantManager().getRepository(Ambulance);
    const ambulance = await ambRepo.findOneOrFail({ where: { id: trip.ambulanceId } });
    ambulance.status = "available";
    ambulance.updatedBy = currentUserId();
    await ambRepo.save(ambulance);

    return saved;
  }
}
