import { MenuItem } from 'primereact/menuitem';

export interface Task {
    toDolistId: number;
    todolistProgramId: number;
    todolistAciklama: string;
    todolistLink: string;
    todolistSicil: string;
    todolistAtanan: string;
    todolistYaratmaTarih: Date;
    todolistGuncellemeTarih: string;
    todolistIscompleted: boolean | null;
    todolistIsactive: boolean;
    todolistIliskiId: number | null;
    todolistYaratan: string | null;
    todolistYaratanIsim: string;
    todolistBildirimtipi: string | null;
    todolistIseditable: boolean;
    todolistTerminTarih?: Date;
    todolistPriority?: string;
}

export interface TaskGetModel {
    persNo: string;
    programId?: number;
}
export interface TaskGetModelComp {
    persNo: string;
    programId?: number;
    count?: number;
}

export interface TaskCreate {
    TodolistProgramId?: number;
    TodolistAciklama?: string;
    TodolistLink?: string;
    TodolistSicil?: string;
    TodolistYaratan?: string;
    TodolistBildirimtipi?: string;
    TodolistTerminTarih?: Date | null;
    TodolistIseditable?: boolean;
    TodolistIsactive?: boolean;
    TodolistIscompleted?: boolean;
    TodolistPriority?: string;
    TodolistAtanan: string;
    TodolistYaratanIsim: string;
}
export interface TaskUpdate {
    ToDolistId: number;
    TodolistProgramId?: number;
    TodolistAciklama?: string;
    TodolistLink?: string;
    TodolistSicil?: string;
    TodolistYaratmaTarih: Date;
    TodolistIscompleted?: boolean;
    TodolistIsactive?: boolean;
    TodolistIliskiId?: number;
    TodolistYaratan?: string;
    TodolistBildirimtipi?: string;
    TodolistIseditable?: boolean;
    TodolistTerminTarih?: Date | null;
    TodolistPriority?: string;
    TodolistAtanan: string;
    TodolistYaratanIsim: string;
}
export interface TaskDeactivate {
    id: number;
}

// export interface CategoryUpdate {
//     categoryId: number;
//     name: string;
//     updateUser: string;
// }
