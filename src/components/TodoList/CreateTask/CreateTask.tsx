import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { TaskCreate } from '../../../models/TodolistModel';
// import '../EditTask/EditTask.css';
import classNames from 'classnames';
import { Tag } from 'primereact/tag';
import { FormatTimeZoneDateTime } from '../../../models/GeneralTypes';

interface CreateTaskProps {
	show: boolean;
	handleClose: () => void;
	handleCreate: (task: TaskCreate) => void;
	persNo: string;
	name: string;
	programOptions: { label: string; value: number }[];
}

const CreateTask: React.FC<CreateTaskProps> = ({
	name,
	show,
	handleClose,
	handleCreate,
	persNo,
	programOptions,
}) => {
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		formState: { errors },
	} = useForm<TaskCreate>();

	const priorityLevels = [
		{ label: 'Acil', value: 'Acil' },
		{ label: 'Yüksek', value: 'Yüksek' },
		{ label: 'Orta', value: 'Orta' },
		{ label: 'Düşük', value: 'Düşük' },
	];
	const iconMap: Record<string, string> = {
		Acil: 'assets/icons/Acil.png',
		Yüksek: 'assets/icons/Yüksek.png',
		Orta: 'assets/icons/Orta.png',
		Düşük: 'assets/icons/Düşük.png',
	};

	const [programId, setProgramId] = useState<number | null>(null);
	const [dueDate, setDueDate] = useState<Date | null>(null);
	const [priority, setPriority] = useState<string | undefined>(undefined);

	useEffect(() => {
		setValue('TodolistIsactive', true);
		setValue('TodolistIscompleted', false);
	}, [setValue]);

	useEffect(() => {
		if (!show) {
			reset({
				TodolistProgramId: undefined,
				TodolistAciklama: '',
				TodolistLink: '',
				TodolistBildirimtipi: undefined,
				TodolistTerminTarih: null,
				TodolistPriority: undefined,
			});
			setProgramId(null);
			setDueDate(null);
			setPriority(undefined);
		}
	}, [show, reset]);

	const onSubmit: SubmitHandler<TaskCreate> = (data) => {
		data.TodolistSicil = persNo;
		data.TodolistYaratan = persNo;
		data.TodolistBildirimtipi = 'Görev';
		data.TodolistIseditable = true;
		data.TodolistAtanan = name;
		data.TodolistYaratanIsim = name;
		if (dueDate) {
			data.TodolistTerminTarih = dueDate;
		}
		if (priority) {
			data.TodolistPriority = priority;
		}
		handleCreate(data);
	};
	// Item template to display icons and text
	const itemTemplate = (option: { label: string; value: string }) => {
		return (
			<div className='p-d-flex p-ai-center'>
				<img
					src={iconMap[option.value]}
					alt={option.value}
					style={{
						width: '20px',
						height: '20px',
						marginRight: '0.5rem',
						verticalAlign: 'middle',
					}}
				/>
				<span>{option.label}</span>
			</div>
		);
	};

	// Value template to display selected icon and text
	const valueTemplate = (option: { label: string; value: string } | null) => {
		if (option) {
			return (
				<div className='p-d-flex p-ai-center'>
					<img
						src={iconMap[option.value]}
						alt={option.value}
						style={{
							width: '20px',
							height: '20px',
							marginRight: '0.5rem',
							verticalAlign: 'middle',
						}}
					/>
					<span>{option.label}</span>
				</div>
			);
		} else {
			return <span>Öncelik Seviyesi Seçin</span>;
		}
	};

	return (
		<Dialog
			header='Görev Oluştur'
			visible={show}
			onHide={handleClose}
			modal
			resizable={false}
			className='create-task-dialog'
		>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='create-task-form'
			>
				{/* Program Adı field */}
				<div className='create-task-field full-width'>
					<label htmlFor='todolistProgramId'>Program Adı</label>
					<Controller
						name='TodolistProgramId'
						control={control}
						rules={{ required: 'Program Adı gereklidir' }}
						render={({ field }) => (
							<Dropdown
								value={programId}
								options={programOptions}
								onChange={(e) => {
									setProgramId(e.value);
									field.onChange(e.value);
								}}
								placeholder='Program Adı Seçin'
								className={classNames('create-task-input', {
									'p-invalid': errors.TodolistProgramId,
								})}
								showClear
							/>
						)}
					/>
					{errors.TodolistProgramId && (
						<span className='create-task-error-message'>
							{errors.TodolistProgramId.message}
						</span>
					)}
				</div>

				{/* Görev Açıklaması field */}
				<div className='create-task-field full-width'>
					<label htmlFor='TodolistAciklama'>Görev Açıklaması</label>
					<textarea
						id='TodolistAciklama'
						{...register('TodolistAciklama', {
							required: 'Görev Açıklaması gereklidir',
						})}
						placeholder='Görev açıklamasını girin'
						className={` aciklama-input  ${
							errors.TodolistAciklama ? 'p-invalid' : ''
						}`}
					/>
					{errors.TodolistAciklama && (
						<span className='create-task-error-message'>
							{errors.TodolistAciklama.message}
						</span>
					)}
				</div>

				{/* Termin Tarihi & Öncelik Seviyesi fields */}
				<div className='create-task-field-row'>
					<div className='create-task-field half-width'>
						<label htmlFor='todolistTerminTarih'>
							Termin Tarihi
						</label>
						<Controller
							name='TodolistTerminTarih'
							control={control}
							render={({ field }) => (
								<Calendar
									value={dueDate}
									onChange={(e) => {
										let selectedDate =
											e.value as Date | null;
										if (selectedDate !== null) {
											selectedDate =
												FormatTimeZoneDateTime(
													selectedDate
												);
										}

										setDueDate(selectedDate);
										field.onChange(selectedDate);
									}}
									placeholder='Termin Tarihini Seçin'
									dateFormat='dd/mm/yy'
									showIcon={true}
									showButtonBar
								/>
							)}
						/>
						{errors.TodolistTerminTarih && (
							<span className='create-task-error-message'>
								{errors.TodolistTerminTarih.message}
							</span>
						)}
					</div>

					<div className='create-task-field half-width'>
						<label htmlFor='TodolistPriority'>
							Öncelik Seviyesi
						</label>
						<Controller
							name='TodolistPriority'
							control={control}
							rules={{ required: 'Öncelik Seviyesi gereklidir' }}
							render={({ field }) => (
								<Dropdown
									value={priority}
									options={priorityLevels}
									onChange={(e) => {
										setPriority(e.value);
										field.onChange(e.value);
									}}
									valueTemplate={valueTemplate}
									itemTemplate={itemTemplate}
									placeholder='Öncelik Seviyesi Seçin'
									className={classNames('create-task-input', {
										'p-invalid': errors.TodolistPriority,
									})}
									showClear
								/>
							)}
						/>
						{errors.TodolistPriority && (
							<span className='create-task-error-message'>
								{errors.TodolistPriority.message}
							</span>
						)}
					</div>
				</div>

				{/* Buttons */}
				<div className='create-task-buttons'>
					<Button
						type='button'
						label='Kapat'
						icon='pi pi-times'
						onClick={handleClose}
						className='create-task-button-secondary'
					/>
					<Button
						label='Oluştur'
						icon='pi pi-check'
						type='submit'
						className='create-task-button-primary'
					/>
				</div>
			</form>
		</Dialog>
	);
};

export default CreateTask;
