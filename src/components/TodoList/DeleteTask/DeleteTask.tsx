import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import './DeleteTask.scss';

interface DeleteTaskProps {
	show: boolean;
	handleClose: () => void;
	handleDelete: (id: number) => void;
	id: number;
}

const DeleteTask: React.FC<DeleteTaskProps> = ({
	show,
	handleClose,
	handleDelete,
	id,
}) => {
	return (
		<Dialog
			header={<span className='delete-task-header'>Görevi Sil</span>}
			visible={show}
			onHide={handleClose}
			modal
			resizable={false}
			className='delete-task-dialog'
		>
			<div className='delete-task-content'>
				<p className='delete-task-message'>
					Bu görevi silmek istediğinize emin misiniz?
					<span className='delete-task-warning'>
						{' '}
						(Bu işlem geri alınamaz)
					</span>
				</p>
			</div>
			<div className='delete-task-dialog-footer'>
				<Button
					label='İptal'
					onClick={handleClose}
					className='delete-task-button delete-task-button-secondary'
				/>
				<Button
					label='Sil'
					onClick={() => handleDelete(id)}
					className='delete-task-button delete-task-button-primary'
				/>
			</div>
		</Dialog>
	);
};

export default DeleteTask;
