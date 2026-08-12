import { Injectable } from "@nestjs/common";
import { ClinicalNote } from "../entities/clinical-note.entity";
import { CreateClinicalNoteDto } from "../dto/create-clinical-note.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class ClinicalNotesService {
  async listForEncounter(encounterId: string): Promise<ClinicalNote[]> {
    return tenantManager()
      .getRepository(ClinicalNote)
      .find({ where: { encounterId }, order: { createdAt: "ASC" } });
  }

  async create(dto: CreateClinicalNoteDto): Promise<ClinicalNote> {
    const repo = tenantManager().getRepository(ClinicalNote);
    const note = repo.create({
      ...dto,
      vitals: dto.vitals ?? {},
      tenantId: currentTenantId(),
      authoredBy: currentUserId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(note);
  }
}
