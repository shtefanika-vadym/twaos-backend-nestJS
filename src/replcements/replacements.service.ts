import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Replacement } from 'src/replcements/replacements.model';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.model';
import { CreateReplacementDto } from 'src/replcements/dto/create-replacement.dto';
import { CertificateStatus } from 'src/certificates/enum/certificate-status';
import { MessageResponse } from 'src/reponse/message-response';
import { ReplacementResponse } from 'src/replcements/responses/replacement-response';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ReplacementsService {
  constructor(
    private mailService: MailService,
    private usersService: UsersService,
    @InjectRepository(Replacement) private replacementRepository: Repository<Replacement>,
  ) {}

  async createReplacement(id: number, dto: CreateReplacementDto): Promise<MessageResponse> {
    const replacedUser: User = await this.usersService.getUserById(id);
    const replacingUser: User = await this.usersService.getUserById(dto.secretary_id);
    const replacement: Replacement = new Replacement();
    replacement.end_date = dto.end_date;
    replacement.start_date = dto.start_date;
    replacement.replacedUser = replacedUser;
    replacement.replacingUser = replacingUser;
    replacement.status = CertificateStatus.pending;
    await this.replacementRepository.save(replacement);
    return { message: 'Replacement created successfully' };
  }

  async getReplacementsByUser(
    id: number,
    userRelation: 'replacedUser' | 'replacingUser',
  ): Promise<ReplacementResponse[]> {
    const relationId = userRelation === 'replacedUser' ? 'replacingUser' : 'replacedUser';
    const replacements: Replacement[] = await this.replacementRepository
      .createQueryBuilder('replacement')
      .leftJoinAndSelect('replacement.replacedUser', 'replacedUser')
      .leftJoinAndSelect('replacement.replacingUser', 'replacingUser')
      .select([
        'replacement.id',
        'replacement.status',
        'replacement.start_date',
        'replacement.end_date',
        `${userRelation}.email`,
        `${userRelation}.program_study`,
        `${userRelation}.first_name`,
        `${userRelation}.last_name`,
      ])
      .where(`${relationId}.id = :id`, {
        id,
      })
      .getMany();

    const formattedReplacements: ReplacementResponse[] = replacements.map(
      (replacement: Replacement): ReplacementResponse => {
        const user: User = replacement[userRelation];
        delete replacement[userRelation];
        return {
          ...replacement,
          ...user,
        };
      },
    );

    return formattedReplacements;
  }

  async getUserReplacements(id: number): Promise<ReplacementResponse[]> {
    return this.getReplacementsByUser(id, 'replacingUser');
  }

  async getUserReplacing(id: number): Promise<ReplacementResponse[]> {
    return this.getReplacementsByUser(id, 'replacedUser');
  }

  async getActiveReplacementByIdAndSecretary(
    secretaryId: number,
    replacementId: number,
  ): Promise<Replacement> {
    const replacement: Replacement = await this.replacementRepository.findOne({
      where: {
        id: replacementId,
        status: CertificateStatus.pending,
        replacingUser: { id: secretaryId },
      },
      relations: ['replacingUser', 'replacedUser'],
    });

    if (!replacement) throw new NotFoundException('Replacement not found');

    return replacement;
  }

  async approveReplacement(secretaryId: number, replacementId: number): Promise<MessageResponse> {
    const replacement: Replacement = await this.getActiveReplacementByIdAndSecretary(
      secretaryId,
      replacementId,
    );

    replacement.status = CertificateStatus.approved;
    await this.replacementRepository.save(replacement);

    this.mailService.sendReplacementStatus(CertificateStatus.approved, replacement);

    return { message: 'Replacement approved successfully' };
  }

  async rejectReplacement(secretaryId: number, replacementId: number): Promise<MessageResponse> {
    const replacement: Replacement = await this.getActiveReplacementByIdAndSecretary(
      secretaryId,
      replacementId,
    );

    replacement.status = CertificateStatus.rejected;
    await this.replacementRepository.save(replacement);

    this.mailService.sendReplacementStatus(CertificateStatus.rejected, replacement);

    return { message: 'Replacement rejected successfully' };
  }
}
