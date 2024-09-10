import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Task, TaskUpdate } from '../../../models/TodolistModel';
import './EditTask.scss'; // Import custom styles
import classNames from 'classnames';

interface EditTaskProps {
	show: boolean;
	handleClose: () => void;
	handleEdit: (task: TaskUpdate) => void;
	currentTask: Task;
	programOptions: { label: string; value: number }[];
}

const EditTask: React.FC<EditTaskProps> = ({
	show,
	handleClose,
	handleEdit,
	currentTask,
	programOptions,
}) => {
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		formState: { errors },
	} = useForm<TaskUpdate>();

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

	const [programId, setProgramId] = useState<number | null>(
		currentTask.todolistProgramId
	);
	const [dueDate, setDueDate] = useState<Date | null>(
		currentTask.todolistTerminTarih
			? new Date(currentTask.todolistTerminTarih)
			: null
	);
	const [priority, setPriority] = useState<string | undefined>(
		currentTask.todolistPriority
	);

	useEffect(() => {
		if (show && currentTask) {
			// Only run when the modal is open and currentTask is defined
			setProgramId(currentTask.todolistProgramId);
			setDueDate(
				currentTask.todolistTerminTarih
					? new Date(currentTask.todolistTerminTarih)
					: null
			);
			setPriority(currentTask.todolistPriority ?? undefined);

			// Setting form values
			setValue('TodolistProgramId', currentTask.todolistProgramId);
			setValue('TodolistAciklama', currentTask.todolistAciklama ?? '');
			setValue(
				'TodolistBildirimtipi',
				currentTask.todolistBildirimtipi ?? undefined
			);
			setValue('TodolistLink', currentTask.todolistLink);
			setValue(
				'TodolistTerminTarih',
				currentTask.todolistTerminTarih
					? new Date(currentTask.todolistTerminTarih)
					: null
			);
			setValue(
				'TodolistPriority',
				currentTask.todolistPriority ?? undefined
			);
		} else if (!show) {
			reset({
				TodolistProgramId: currentTask.todolistProgramId,
				TodolistAciklama: '',
				TodolistLink: '',
				TodolistBildirimtipi: undefined,
				TodolistTerminTarih: null,
				TodolistPriority: undefined,
			});
		}
	}, [currentTask, setValue, show]);

	const onSubmit: SubmitHandler<TaskUpdate> = (data) => {
		const updatedTask: TaskUpdate = {
			...data,
			ToDolistId: currentTask.toDolistId,
			TodolistSicil: currentTask.todolistSicil ?? null,
			TodolistYaratmaTarih:
				currentTask.todolistYaratmaTarih ?? '0001-01-01T00:00:00',
			TodolistIscompleted: currentTask.todolistIscompleted ?? undefined,
			TodolistIsactive: currentTask.todolistIsactive ?? null,
			TodolistYaratan: currentTask.todolistYaratan ?? undefined,
			TodolistIseditable: currentTask.todolistIseditable ?? null,
			TodolistAtanan: currentTask.todolistAtanan,
			TodolistYaratanIsim: currentTask.todolistYaratanIsim,
		};

		handleEdit(updatedTask);
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
			header='Görevi Düzenle'
			visible={show}
			onHide={handleClose}
			modal
			resizable={false}
			className='edit-task-dialog'
		>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='edit-task-form'
			>
				{/* Program Adı field */}
				<div className='edit-task-field full-width'>
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
								className={classNames('edit-task-input', {
									'p-invalid': errors.TodolistProgramId,
								})}
								showClear
							/>
						)}
					/>
					{errors.TodolistProgramId && (
						<span className='edit-task-error-message'>
							{errors.TodolistProgramId.message}
						</span>
					)}
				</div>

				{/* Görev Açıklaması field */}
				<div className='edit-task-field full-width'>
					<label htmlFor='TodolistAciklama'>Görev Açıklaması</label>
					<Controller
						name='TodolistAciklama'
						control={control}
						rules={{ required: 'Görev Açıklaması gereklidir' }}
						render={({ field }) => (
							<textarea
								id='TodolistAciklama'
								value={field.value} // Use field.value to bind the input value
								onChange={(e) => field.onChange(e.target.value)} // Handle change using field.onChange
								placeholder='Görev açıklamasını girin'
								className={` aciklama-input  ${
									errors.TodolistAciklama ? 'p-invalid' : ''
								}`}
								style={{ resize: 'none' }}
							/>
						)}
					/>
					{errors.TodolistAciklama && (
						<span className='edit-task-error-message'>
							{errors.TodolistAciklama.message}
						</span>
					)}
				</div>

				{/* Termin Tarihi & Öncelik Seviyesi fields */}
				<div className='edit-task-field-row'>
					<div className='edit-task-field half-width'>
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
										const selectedDate =
											e.value as Date | null;
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
							<span className='edit-task-error-message'>
								{errors.TodolistTerminTarih.message}
							</span>
						)}
					</div>

					<div className='edit-task-field half-width'>
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
									className={classNames('edit-task-input', {
										'p-invalid': errors.TodolistPriority,
									})}
									showClear
								/>
							)}
						/>
						{errors.TodolistPriority && (
							<span className='edit-task-error-message'>
								{errors.TodolistPriority.message}
							</span>
						)}
					</div>
				</div>

				{/* Buttons */}
				<div className='edit-task-buttons'>
					<Button
						type='button'
						label='Kapat'
						icon='pi pi-times'
						onClick={handleClose}
						className='edit-task-button-secondary'
					/>
					<Button
						label='Düzenle'
						icon='pi pi-check'
						type='submit'
						className='edit-task-button-primary'
					/>
				</div>
			</form>
		</Dialog>
	);
};

export default EditTask;
