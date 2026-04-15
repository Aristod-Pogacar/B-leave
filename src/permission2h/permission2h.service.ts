import { Injectable } from '@nestjs/common';
import { Permission2h } from './entities/permission2h.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreatePermission2hDto } from './dto/create-permission2h.dto';
import { UpdatePermission2hDto } from './dto/update-permission2h.dto';
import { Employee } from 'src/employee/entities/employee.entity';
import { Between } from 'typeorm';
import { Response } from 'express';

import * as nodemailer from 'nodemailer';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/user/entities/user.entity';
import { LeaveStatus } from 'src/leave/entities/leave.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { HistoryService } from 'src/history/history.service';
import { HistoryReason } from 'src/history/entities/history.entity';

const ExcelJS = require('exceljs');

@Injectable()
export class Permission2hService {

  constructor(
    private readonly userService: UserService,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Permission2h)
    private permission2hRepository: Repository<Permission2h>,
    // @InjectRepository(Payroll)
    // private payrollRepository: Repository<Payroll>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly historyService: HistoryService,
  ) {
  }

  // async sendEmail(employee: Employee) {
  //   return await envoyerEmail(employee);
  // }
  async rejectLeave(permissionId: string, userId: string) {
    const permission = await this.permission2hRepository.findOne({ where: { id: permissionId } });
    if (!permission) {
      throw new Error('Permission not found');
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    permission.status = LeaveStatus.REJECTED;
    permission.approver = user;
    permission.approved_date = new Date();
    return this.permission2hRepository.save(permission);
  }

  async approveLeave(permissionId: string, userId: string) {
    const permission = await this.permission2hRepository.findOne({ where: { id: permissionId } });
    if (!permission) {
      throw new Error('Permission not found');
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    permission.status = LeaveStatus.APPROVED;
    permission.approver = user;
    permission.approved_date = new Date();
    return this.permission2hRepository.save(permission);
  }

  async getNonApprouvedLeaves(id: any) {
    return this.permission2hRepository.find({ where: { employee: { manager: { id } }, status: LeaveStatus.PENDING }, relations: ['employee'], order: { date: 'ASC' } });
  }

  async paginatePermission2h(
    search: string,
    page: number,
    limit: number,
    date: string,
    user: any,
  ) {
    const skip = (page - 1) * limit;

    let query;

    query = this.permission2hRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.employee', 'employee');

    if (user.role == UserRole.MANAGER) {
      query.andWhere('employee.manager = :manager', { manager: user.id });
    }

    // ✅ Recherche multi-champs sécurisée
    if (search) {
      query.andWhere(
        `
        employee.matricule LIKE :search
        OR employee.fullname LIKE :search
        OR p.id LIKE :search
        OR p.reason LIKE :search
        OR p.expectedStartTime LIKE :search
        OR p.expectedEndTime LIKE :search
        OR DATE(p.date) LIKE :search
        `,
        { search: `%${search}%` },
      );
    }

    if (date) {
      query.where('DATE(p.date) = :date', { date });
    }

    const [data, total] = await query
      .orderBy('p.date', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
  async paginatePermission2hById(
    id: number,
    search: string,
    page: number,
    limit: number,
    date: string,
  ) {
    console.log("ID:", id);
    const skip = (page - 1) * limit;
    const query = this.permission2hRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.employee', 'employee')
      .where('p.id = :id', { id });

    // // ✅ Recherche multi-champs sécurisée
    // if (search) {
    //   query.where(
    //     `
    //     p.id = :id
    //     `,
    //     { id: `%${id}%` },
    //   );
    // }

    if (date) {
      query.where('DATE(p.date) = :date', { date });
    }

    const [data, total] = await query
      .orderBy('p.date', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async create(dto: CreatePermission2hDto) {
    // 1. Récupérer l'employé correspondant au matricule
    const employee = await this.employeeRepository.findOne({
      where: { matricule: dto.employee },
      relations: ['manager']
    });

    if (!employee) {
      throw new Error(`Employee with matricule ${dto.employee} not found`);
    }

    // 2. Construire l'entité complète
    const entity = this.permission2hRepository.create({
      ...dto,
      employee,  // Remplacement du string par l'objet Employee
    });

    // 3. Enregistrer
    const permission = await this.permission2hRepository.save(entity);
    await this.historyService.create({
      reason: HistoryReason.PERMISSION_2H,
      message: "Permission 2h " + permission.date + " of " + permission.employee.fullname + " requested by QUIOSQUE",
    });

    var email: string[] = [];
    const manager = employee.manager;
    if (manager) email.push(manager.email);

    const emailAdress = this.configService.get<string>('EMAIL_ADRESS')
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD')
    if (email.length > 0) {
      if (emailAdress && emailPassword) {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Consultation médicale',
          text: 'Consultation médicale',
          html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        <p>
          Bonjour Monsieur/Madame,
        </p>
        <p>
          Nous souhaitons vous informer que l'employé(e) avec la matricule <strong>${employee.matricule} (${employee.fullname})</strong> a pris une permission de deux heures.
        </p>
        <p>
          <strong>
            Raison: ${permission.reason}<br>
            Heure de départ: ${permission.expectedStartTime}<br>
            Heure d'arrivé: ${permission.expectedEndTime}<br>
          </strong>
        </p>
        <p>
          Cordialement,<br>
          L'équipe RH
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>
          Hello Mister/Misses,
        </p>
        <p>
          We would like to inform you that the employee with matricule <strong>${employee.matricule} (${employee.fullname})</strong> has taken a two-hour leave.
        </p>
        <p>
          <strong>
            Reason: ${permission.reason}<br>
            Start time: ${permission.expectedStartTime}<br>
            End time: ${permission.expectedEndTime}<br>
          </strong>
        </p>
        <p>
          Best regards,<br>
          HR Team
        </p>
      </div>
    `
        });
      }
    }
    return permission;
  }

  findAll() {
    return this.permission2hRepository.find();
  }

  findOne(id: string) {
    return this.permission2hRepository.findOne({ where: { id } });
  }

  async getPermission2h(date: string, site: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.permission2hRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.employee', 'e')
      .where('p.date BETWEEN :start AND :end', { start, end })
      .andWhere('e.site = :site', { site })
      .getMany();
  }

  async exportPermission2hToExcel(
    data: any[],
    res: Response,
    date: string,
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Permission 2h');

    /* ================= TITRE ================= */
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `PERMISSION 2H - ${date}`;
    titleCell.font = {
      size: 16,
      bold: true,
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    /* ================= EN-TÊTES ================= */
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      'Matricule',
      'Full name',
      'Site',
      'Reason',
      'Date',
      'Quitted time',
      'Return time',
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    /* ================= DONNÉES ================= */
    data.forEach((p) => {
      worksheet.addRow([
        p.employee.matricule,
        p.employee.fullname,
        p.employee.site,
        p.reason,
        p.date,
        p.expectedStartTime,
        p.expectedEndTime,
      ]);
    });

    /* ================= LARGEUR DES COLONNES ================= */
    worksheet.columns = [
      { width: 15 },
      { width: 30 },
      { width: 15 },
      { width: 30 },
      { width: 15 },
      { width: 20 },
      { width: 20 },
    ];

    /* ================= FOOTER ================= */
    worksheet.addRow([]);
    worksheet.addRow([`Exported on ${new Date().toLocaleString()}`]);

    /* ================= RÉPONSE HTTP ================= */
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=permission2h_${date}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }


  async update(id: string, dto: UpdatePermission2hDto) {
    // 1. Vérifier que la permission existe
    const permission = await this.permission2hRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new Error(`Permission with id ${id} not found`);
    }

    if (!dto.employee) {
      throw new Error(`Employee with id ${dto.employee} not found`);
    }

    // 2. S'il y a un employee dans le DTO → charger la relation
    let employee = await this.employeeRepository.findOne({
      where: { matricule: dto.employee },
    });

    if (!employee) {
      throw new Error(
        `Employee with matricule '${dto.employee}' not found`
      );

    }

    // 3. Fusionner les valeurs déjà existantes avec les nouvelles
    const updated = this.permission2hRepository.merge(permission, {
      ...dto,
      employee, // relation mise à jour ou conservée
    });

    // 4. Sauvegarder
    return await this.permission2hRepository.save(updated);
  }

  remove(id: string) {
    return this.permission2hRepository.delete(id);
  }

  async countToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.permission2hRepository.count({
      where: {
        date: today,
      },
    });
  }

}
