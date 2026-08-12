import { Injectable } from "@nestjs/common";
import { Ward } from "../entities/ward.entity";
import { Bed } from "../entities/bed.entity";
import { tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class BedsService {
  async listWards(): Promise<Ward[]> {
    return tenantManager().getRepository(Ward).find({ order: { name: "ASC" } });
  }

  /** Powers the bed board (§10 dashboard mockup's "Bed occupancy by ward" widget) — one flat list, grouped by ward client-side. */
  async listBeds(): Promise<Bed[]> {
    return tenantManager().getRepository(Bed).find({ order: { label: "ASC" } });
  }
}
