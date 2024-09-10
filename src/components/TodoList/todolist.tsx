import React, { useState, useEffect, useMemo } from 'react';
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator, FilterService } from 'primereact/api';
import {
	DataTable,
	DataTableFilterMeta,
	DataTableSortEvent,
} from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import moment from 'moment';
import './todolist.scss';
import { UserService } from '../../service/UserService';
import { Task } from '../../models/TodolistModel';
import { MenuItem } from 'primereact/menuitem';
import { Calendar } from 'primereact/calendar';
import { setProgramid } from '../../storage/store/slices/programidSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../storage/store/rootReducer';
import { toggleCompleted } from '../../storage/store/slices/completedSlice';
import { setUserName } from '../../storage/store/slices/userSlice';
import FloatingLabelDropdown from './float/FloatDropdown';
interface ToDoListProps {
	title: string;
	todoList: Task[];
	onCheckboxChange: (task: Task) => void;
	onConfirmChange: () => void;
	onCancelChange: () => void;
	toggleMenu: (
		event: React.MouseEvent<HTMLButtonElement>,
		task: Task
	) => void;
	menuItems: MenuItem[];
	selectedOption: number;
	setSelectedOption: (value: number) => void;
	prevselectedOption: number;
	setprevSelectedOption: (value: number) => void;
	createModal: () => void;
	programOptions: { label: string; value: number }[];
	isConfirmDialogVisible: boolean;
	first: number;
	setFirst: (value: number) => void;
	setSecond: (value: number) => void;
	filters: DataTableFilterMeta;
	setFilters: (filters: DataTableFilterMeta) => void;
	globalFilterValue: string;
	setGlobalFilterValue: (value: string) => void;
}

// Utility function to calculate the number of days since the given date
const calculateDaysSinceTerminTarih = (date: Date) => {
	const currentDate = new Date();

	// Reset hours, minutes, seconds, and milliseconds to compare only dates
	currentDate.setHours(0, 0, 0, 0);
	date.setHours(0, 0, 0, 0);

	const timeDiff = currentDate.getTime() - date.getTime();
	return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Register custom filter for `todolistYaratmaTarih` based on date range
FilterService.register(
	'custom_todolistYaratmaTarih',
	(value: any, filters: any) => {
		if (!filters || filters.length === 0) return true; // No filters applied

		const [from, to] = filters ?? [null, null];
		if (!from && !to) return true; // No dates selected, treat as no filter

		const taskDate = new Date(value).setHours(0, 0, 0, 0);
		const fromDate = from ? new Date(from).setHours(0, 0, 0, 0) : null;
		const toDate = to ? new Date(to).setHours(0, 0, 0, 0) : null;

		if (fromDate && !toDate) return fromDate <= taskDate;
		if (!fromDate && toDate) return taskDate <= toDate;
		if (fromDate && toDate)
			return fromDate <= taskDate && taskDate <= toDate;

		return true;
	}
);

// Register custom filter for `todolistTerminTarih` based on dropdown and date range
FilterService.register(
	'custom_todolistTerminTarih',
	(value: any, filters: any) => {
		if (!filters) return true; // No filters applied
		const { fromDate = null, toDate = null, dropdown = null } = filters;

		// If both dates and the dropdown are null, treat as no filter applied.
		if (!fromDate && !toDate && !dropdown) return true;

		const taskDate = value ? new Date(value).setHours(0, 0, 0, 0) : null;

		// Date Range Filtering
		let isInDateRange = true;
		if (fromDate || toDate) {
			if (!taskDate) return false; // If task has no date, it doesn't match date range filter
			const fromDateValue = fromDate
				? new Date(fromDate).setHours(0, 0, 0, 0)
				: null;
			const toDateValue = toDate
				? new Date(toDate).setHours(0, 0, 0, 0)
				: null;

			if (fromDateValue && !toDateValue)
				isInDateRange = fromDateValue <= taskDate;
			else if (!fromDateValue && toDateValue)
				isInDateRange = taskDate <= toDateValue;
			else if (fromDateValue && toDateValue)
				isInDateRange =
					fromDateValue <= taskDate && taskDate <= toDateValue;
		}

		// Dropdown Filtering
		let matchesDropdown = true;
		if (dropdown) {
			if (!taskDate) {
				matchesDropdown = dropdown === 'Tarih Yok';
			} else {
				const daysDiff =
					(taskDate - new Date().setHours(0, 0, 0, 0)) /
					(1000 * 60 * 60 * 24);
				if (dropdown === 'Tarihi Gecmis')
					matchesDropdown = daysDiff < 0;
				else if (dropdown === 'Yakin')
					matchesDropdown = daysDiff >= 0 && daysDiff <= 15;
				else if (dropdown === 'Uzak') matchesDropdown = daysDiff > 15;
				else matchesDropdown = false;
			}
		}

		return isInDateRange && matchesDropdown;
	}
);

const ToDoList: React.FC<ToDoListProps> = ({
	setSecond,
	selectedOption,
	setSelectedOption,
	programOptions,
	...props
}) => {
	const dispatch = useDispatch();
	const [visible, setVisible] = useState(false);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

	const userservice = new UserService();
	const statuses = useMemo(() => ['Görev', 'Bildirim'], []);
	const priorityLevels = useMemo(
		() => ['Acil', 'Yüksek', 'Orta', 'Düşük'],
		[]
	);
	const dateStatuses = useMemo(
		() => ['Tarihi Gecmis', 'Yakin', 'Uzak', 'Tarih Yok'],
		[]
	);
	const isCompleted = useSelector((state: RootState) => state.completed);

	const [sortField, setSortField] = useState<string | undefined>(undefined);
	const [sortOrder, setSortOrder] = useState<0 | 1 | -1 | undefined>(
		undefined
	);
	const [rows, setRows] = useState<number>(10); // Number of records per page
	// const [paginatedData, setPaginatedData] = useState<Task[]>([]); // State to hold the paginated data

	// Update paginatedData whenever first, rows, or todoList change
	// useEffect(() => {
	//     const updatedData = props.todoList.slice(props.first, props.first + rows);
	//     setPaginatedData(updatedData);
	// }, [props.first, rows, props.todoList]);
	// Handle sorting logic
	const onSort = (event: DataTableSortEvent) => {
		const { sortField: field, sortOrder: order } = event;

		if (sortField === field) {
			if (sortOrder === 1) {
				setSortOrder(-1); // Next click -> descending
			} else if (sortOrder === -1) {
				setSortField(undefined); // Next click -> clear sorting
				setSortOrder(undefined);
			} else {
				setSortOrder(1); // Next click -> ascending
			}
		} else {
			setSortField(field);
			setSortOrder(1); // Start with ascending when a new column is sorted
		}
	};

	// Handle filter changes and update the Redux store
	const onFilterChange = (newFilters: DataTableFilterMeta) => {
		if (JSON.stringify(props.filters) !== JSON.stringify(newFilters)) {
			props.setFilters(newFilters);
		}

		const programFilter = newFilters['todolistProgramId'];
		if (programFilter && 'value' in programFilter && !programFilter.value) {
			dispatch(setProgramid(-5));
		}

		props.setFilters(newFilters);
	};

	const renderHeader = () => (
		<div className='flex justify-content-between'>
			<div className='flex align-items-center'>
				<i
					className='pi pi-list'
					style={{
						marginRight: '0.5rem',
						color: !isCompleted ? '#8A2BE2' : 'inherit',
					}}
				></i>
				<span
					style={{
						cursor: 'pointer',
						marginRight: '1rem',
						color: !isCompleted ? '#8A2BE2' : 'inherit',
					}}
					onClick={handleToggle}
				>
					Yapılacaklar
				</span>
				<span
					style={{
						cursor: 'pointer',
						color: isCompleted ? '#8A2BE2' : 'inherit',
					}}
					onClick={handleToggle}
				>
					Tamamlananlar
				</span>
			</div>
			<div className='flex justify-content-end'>
				{isCompleted && (
					<div style={{ width: '12rem', marginRight: '1rem' }}>
						<FloatingLabelDropdown
							options={[
								{ label: '100', value: 100 },
								{ label: '500', value: 500 },
								{ label: '1000', value: 1000 },
								{ label: 'Hepsi', value: -5 },
							]}
							selectedOption={selectedOption}
							setSelectedOption={setSelectedOption}
							setprevSelectedOption={props.setprevSelectedOption}
							label='Görev Sayısı'
						/>
					</div>
				)}
				<Button
					type='button'
					icon='pi pi-filter-slash'
					label='Temizle'
					outlined
					onClick={() => {
						clearFilters();
						dispatch(setProgramid(-5));
						setGlobalFilterValue('');
						setSortField(undefined); // Reset the sort field
						setSortOrder(undefined); // Reset the sort order
						setSelectedOption(100);
						//for setting the page numbers
						props.setFirst(0);
						setSecond(0);
					}}
					style={{ marginRight: '0.5rem' }}
				/>

				<span className='p-input-icon-left'>
					<i className='pi pi-search' />
					<InputText
						value={globalFilterValue}
						onChange={(e) => {
							setGlobalFilterValue(e.target.value);
							const newFilters: DataTableFilterMeta = {
								...props.filters,
								global: {
									value: e.target.value,
									matchMode: FilterMatchMode.CONTAINS,
								},
							};
							onFilterChange(newFilters);
						}}
						placeholder='Arama'
					/>
				</span>
				<Button
					label='Görev Oluştur'
					icon='pi pi-plus'
					onClick={props.createModal}
					className='p-button-primary'
					style={{ marginLeft: '0.5rem' }}
				/>
			</div>
		</div>
	);

	// Clear all filters
	const clearFilters = () => {
		props.setFilters({
			global: { value: null, matchMode: FilterMatchMode.CONTAINS },
			todolistAciklama: {
				operator: FilterOperator.AND,
				constraints: [
					{ value: null, matchMode: FilterMatchMode.CONTAINS },
				],
			},
			todolistYaratanIsim: {
				value: null,
				matchMode: FilterMatchMode.STARTS_WITH,
			},
			todolistPriority: {
				value: null,
				matchMode: FilterMatchMode.EQUALS,
			},
			todolistBildirimtipi: {
				value: null,
				matchMode: FilterMatchMode.EQUALS,
			},
			todolistTerminTarih: {
				value: null,
				matchMode: FilterMatchMode.CUSTOM,
			},
			todolistYaratmaTarih: {
				value: null,
				matchMode: FilterMatchMode.CUSTOM,
			},
			todolistProgramId: {
				value: null,
				matchMode: FilterMatchMode.EQUALS,
			},
		});
	};

	// Toggle between completed and incomplete tasks
	const handleToggle = () => {
		dispatch(toggleCompleted());
	};

	const userNames = useSelector((state: RootState) => state.users);

	useEffect(() => {
		const updateUserNames = () => {
			const updatedUsers = new Set<string>();

			for (const task of props.todoList) {
				const userId = task.todolistYaratan ?? '';
				const userName = task.todolistYaratanIsim ?? ''; // Use the name directly from `todolistYaratanIsim`

				if (userId && userName && !updatedUsers.has(userId)) {
					updatedUsers.add(userId);

					console.log('using existing user name', userName);
					dispatch(setUserName({ userId, userName }));
				}
			}
		};

		updateUserNames();
		console.log(userNames);
	}, [props.todoList, dispatch]);
	// useEffect(() => {
	//     const logDifferentYaratans = () => {
	//         for (const task of props.todoList) {
	//             const yaratan = task.todolistYaratan;

	//             if (yaratan && yaratan !== '3914') {
	//                 console.log('Different Yaratans:', task);
	//             }
	//         }
	//     };

	//     logDifferentYaratans();
	// }, [props.todoList]);

	// // Fetch the username by user ID
	// const getUserName = async (a: string) => {
	//     try {
	//         const user = await userservice.getUserByPersId(a);
	//         console.log(user.userName);
	//         return user.userName || 'Unknown';
	//     } catch (error) {
	//         console.error('Error fetching user:', error);
	//         return 'Error';
	//     }
	// };

	// Render the table header with global search and other controls

	// Render truncated task description with a checkbox for completion
	const renderAciklama = (task: Task) => {
		const maxLength = 40;
		const isTruncated = task.todolistAciklama?.length > maxLength;
		const displayedText = isTruncated
			? `${task.todolistAciklama.substring(0, maxLength)}...`
			: task.todolistAciklama;

		return (
			<div
				className='flex align-items-center'
				style={{ width: '100%' }}
			>
				<Checkbox
					onChange={() => props.onCheckboxChange(task)}
					checked={task.todolistIscompleted === true}
					inputId={task.toDolistId.toString()}
					className='mr-2'
					style={{ flexShrink: 0 }}
				/>
				<span
					className={classNames(
						'font-medium text-overflow-ellipsis overflow-hidden',
						{}
					)}
					style={{
						minWidth: '0',
						flex: '1 1 auto',
						paddingLeft: '0.5rem',
					}}
					title={task.todolistAciklama}
				>
					{displayedText || 'No description'}
				</span>
				{isTruncated && (
					<Button
						icon='pi pi-eye'
						className='p-button-rounded p-button-text p-button-sm'
						style={{ marginLeft: '10px', flexShrink: 0 }}
						onClick={() => showDialog(task)}
					/>
				)}
			</div>
		);
	};
	const handlePageChange = (event: any) => {
		props.setFirst(event.first);
		setRows(event.rows);
	};

	// Show dialog with task details
	const showDialog = (task: Task) => {
		setSelectedTask(task);
		setVisible(true);
	};

	// Hide dialog
	const hideDialog = () => {
		setVisible(false);
		setSelectedTask(null);
	};

	// Format a date to DD/MM/YYYY string
	const formatDate = (date: Date): string =>
		moment(date).format('DD/MM/YYYY');

	// Format the `todolistTerminTarih` field with tags indicating date proximity
	const formatDatecomp = (dateString: string | undefined): JSX.Element => {
		if (!dateString) {
			return (
				<div className='flex align-items-center'>
					<i
						className='pi pi-clock mr-2'
						style={{ color: 'black', fontSize: '1.15rem' }}
					></i>
					<Tag value='Tarih Yok' />
				</div>
			);
		}

		const date = new Date(dateString);
		if (!isNaN(date.getTime())) {
			const diff = calculateDaysSinceTerminTarih(date);
			let severity: 'success' | 'danger' | 'warning' | 'info' = 'success';
			let label = `${Math.abs(diff)} Gün Kaldı`;

			if (diff > 0) {
				severity = 'danger';
				label = `${Math.abs(diff)} Gün Geçti`;
			} else if (diff >= -15) {
				severity = 'warning';
			}

			return (
				<div className='flex align-items-center'>
					<i
						className='pi pi-clock mr-2'
						style={{ color: 'black', fontSize: '1.15rem' }}
					></i>
					<Tag
						severity={severity}
						value={label}
					/>
				</div>
			);
		} else {
			return <Tag value={moment(dateString).format('DD/MM/YYYY')} />;
		}
	};

	const userNameFilterTemplate = (
		options: ColumnFilterElementTemplateOptions
	) => (
		<Dropdown
			value={options.value}
			options={Object.entries(userNames).map(([key, name]) => ({
				label: `${name} (${key})`, // Display both name and ID in the dropdown label
				value: name, // Use the name for filtering
			}))}
			onChange={(e: DropdownChangeEvent) =>
				options.filterApplyCallback(e.value)
			}
			placeholder='Oluşturan Seç'
			className='p-column-filter'
			showClear
			style={{ minWidth: '12rem', width: '17rem', maxWidth: '20rem' }}
		/>
	);

	// Filter template for filtering by date status (e.g., "Tarihi Gecmis", "Yakin")
	const dateStatusFilterTemplate = (
		options: ColumnFilterElementTemplateOptions
	) => (
		<Dropdown
			value={options.value}
			options={dateStatuses}
			onChange={(e: DropdownChangeEvent) =>
				options.filterApplyCallback(e.value)
			}
			placeholder='Tarih Durumunu Seç'
			className='p-column-filter'
			showClear
			style={{ minWidth: '12rem' }}
		/>
	);

	// Combined filter template for both dropdown and date range filters
	const combinedFilterTemplate = (
		options: ColumnFilterElementTemplateOptions
	) => {
		const {
			fromDate = null,
			toDate = null,
			dropdown = null,
		} = options.value || {};

		const handleFromDateChange = (e: any) => {
			options.filterApplyCallback({
				dropdown,
				fromDate: e.value,
				toDate,
			});
		};

		const handleToDateChange = (e: any) => {
			options.filterApplyCallback({
				dropdown,
				fromDate,
				toDate: e.value,
			});
		};

		const handleDropdownChange = (e: DropdownChangeEvent) => {
			const newValue = e.value;
			if (newValue == null) {
				clearFilters();
			} else {
				options.filterApplyCallback({
					dropdown: newValue,
					fromDate,
					toDate,
				});
			}
		};

		const clearFilters = () => {
			options.filterApplyCallback({
				dropdown: null,
				fromDate: null,
				toDate: null,
			});
		};

		return (
			<div className='flex flex-column gap-2'>
				<Dropdown
					value={dropdown}
					options={dateStatuses}
					onChange={handleDropdownChange}
					placeholder='Tarih Durumu Seç'
					className='p-column-filter'
					showClear
					style={{ minWidth: '12rem' }}
				/>
				<div className='flex gap-2'>
					<Calendar
						value={fromDate}
						onChange={handleFromDateChange}
						placeholder='Bu Tarihten'
						dateFormat='dd/mm/yy'
						style={{ width: '6rem' }}
					/>
					<Calendar
						value={toDate}
						onChange={handleToDateChange}
						placeholder='Bu Tarihe'
						dateFormat='dd/mm/yy'
						style={{ width: '6rem' }}
					/>
				</div>
			</div>
		);
	};

	// Filter template for filtering by creation date range
	const yaratmaTarihFilterTemplate = (
		options: ColumnFilterElementTemplateOptions
	) => {
		const [fromDate, toDate] = options.value
			? [...options.value]
			: [null, null];

		const handleFromDateChange = (e: any) => {
			options.filterApplyCallback([e.value, toDate]);
		};

		const handleToDateChange = (e: any) => {
			options.filterApplyCallback([fromDate, e.value]);
		};

		return (
			<div className='flex gap-2'>
				<Calendar
					value={fromDate}
					onChange={handleFromDateChange}
					placeholder='Bu Tarihten'
					dateFormat='dd/mm/yy'
					style={{ width: '6rem' }}
				/>
				<Calendar
					value={toDate}
					onChange={handleToDateChange}
					placeholder='Bu Tarihe'
					dateFormat='dd/mm/yy'
					style={{ width: '6rem' }}
				/>
			</div>
		);
	};
	const iconMap: Record<string, string> = {
		Acil: 'assets/icons/Acil.png', // Add the icon path for "Acil"
		Yüksek: 'assets/icons/Yüksek.png',
		Orta: 'assets/icons/Orta.png',
		Düşük: 'assets/icons/Düşük.png',
	};

	// Filter template for filtering by priority level (e.g., "Yüksek", "Orta", "Düşük")
	const priorityRowFilterTemplate = (
		options: ColumnFilterElementTemplateOptions
	) => {
		// Icons for different priority levels

		// Define item template to display priority with icons
		const itemTemplate = (option: string) => {
			return (
				<div className='p-d-flex p-ai-center'>
					<img
						src={iconMap[option]}
						alt={option}
						style={{
							width: '20px',
							height: '20px',
							marginRight: '0.5rem',
							verticalAlign: 'middle',
						}}
					/>
					<span>{option}</span>
				</div>
			);
		};

		// Define value template to display the selected priority or placeholder text
		const valueTemplate = (option: string | null) => {
			if (option) {
				return (
					<div className='p-d-flex p-ai-center'>
						<img
							src={iconMap[option]}
							alt={option}
							style={{
								width: '20px',
								height: '20px',
								marginRight: '0.5rem',
								verticalAlign: 'middle',
							}}
						/>
						<span>{option}</span>
					</div>
				);
			} else {
				return <span>Önem Seviyesi Seç</span>; // Show placeholder text when no value is selected
			}
		};
		return (
			<Dropdown
				value={options.value}
				options={priorityLevels}
				onChange={(e: DropdownChangeEvent) =>
					options.filterApplyCallback(e.value)
				}
				itemTemplate={itemTemplate}
				valueTemplate={valueTemplate}
				placeholder='Önem Seviyesi Seç'
				className='p-column-filter'
				showClear
				style={{ minWidth: '12rem' }}
			/>
		);
	};

	// Filter template for filtering by notification type (e.g., "Görev", "Bildirim")
	const bildirimTipiFilterTemplate = (
		options: ColumnFilterElementTemplateOptions
	) => (
		<Dropdown
			value={options.value}
			options={statuses}
			onChange={(e: DropdownChangeEvent) =>
				options.filterApplyCallback(e.value)
			}
			itemTemplate={(option: string) => (
				<Tag
					value={option}
					severity={option === 'Görev' ? 'warning' : 'info'}
				/>
			)}
			valueTemplate={(option: string) =>
				option ? (
					<Tag
						value={option}
						severity={option === 'Görev' ? 'warning' : 'info'}
					/>
				) : (
					<span>Bildirim Tipi Seç</span> // Show placeholder text when no value is selected
				)
			}
			placeholder='Bildirim Tipi Seç'
			className='p-column-filter'
			showClear
			style={{ minWidth: '12rem' }}
		/>
	);

	// Filter template for filtering by program name
	const programFilterTemplate = (
		options: ColumnFilterElementTemplateOptions
	) => {
		const handleProgramChange = (e: DropdownChangeEvent) => {
			if (e.value === undefined) {
				handleClear();
			} else {
				dispatch(setProgramid(e.value));
				options.filterApplyCallback(e.value);
			}
		};

		const handleClear = () => {
			dispatch(setProgramid(-5));
			options.filterApplyCallback(null);
		};

		return (
			<Dropdown
				value={options.value}
				options={programOptions}
				onChange={handleProgramChange}
				placeholder='Program Id Seç'
				className='p-column-filter'
				showClear
				style={{ minWidth: '12rem' }}
			/>
		);
	};
	const isMobile = window.innerWidth <= 768;

	const header = useMemo(
		() => renderHeader(),
		[globalFilterValue, isCompleted, selectedOption]
	);

	return (
		<div
			className='card'
			style={{
				width: isMobile ? '350%' : 'auto', // Full width on mobile
			}}
		>
			<DataTable
				value={props.todoList}
				first={props.first}
				onPage={handlePageChange} // Your custom page change handler
				paginator
				totalRecords={props.todoList.length}
				rows={rows}
				rowsPerPageOptions={[5, 10, 25, 50]}
				paginatorTemplate='FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown'
				currentPageReportTemplate='{first} to {last} of {totalRecords}'
				dataKey='toDolistId'
				filters={props.filters}
				filterDisplay='menu'
				header={header}
				globalFilterFields={[
					'todolistAciklama',
					'todolistYaratanIsim',
					'todolistPriority',
					'todolistBildirimtipi',
				]}
				emptyMessage='No tasks found.'
				sortField={sortField}
				sortOrder={sortOrder}
				onSort={onSort as any}
				onFilter={(e) => onFilterChange(e.filters)}
			>
				<Column
					field='todolistAciklama'
					header='Yapılacaklar'
					body={(task: Task) => (
						<div
							style={{
								minHeight: '5vh',
								height: '5vh',
								maxHeight: '10vh',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{renderAciklama(task)}
						</div>
					)}
					style={{
						minWidth: '20rem',
						width: '23rem',
						maxWidth: '27rem',
					}}
					sortable
					filter
					filterPlaceholder='Açıklamaya göre ara'
				/>

				<Column
					field='todolistProgramId'
					header='Program Adı'
					body={(task: Task) => (
						<div
							style={{
								minHeight: '5vh',
								height: '5vh',
								maxHeight: '10vh',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{programOptions.find(
								(option) =>
									option.value === task.todolistProgramId
							)?.label || 'Bilinmeyen Program'}
						</div>
					)}
					style={{
						minWidth: '10rem',
						width: '16rem',
						maxWidth: '20rem',
					}}
					filter
					filterMatchMode={FilterMatchMode.EQUALS}
					filterElement={programFilterTemplate}
					showFilterMatchModes={false}
					sortable
				/>

				<Column
					field='todolistBildirimtipi'
					header='Bildirim Tipi'
					body={(task: Task) => (
						<div
							style={{
								minHeight: '5vh',
								height: '5vh',
								maxHeight: '10vh',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Tag
								value={task.todolistBildirimtipi}
								severity={
									task.todolistBildirimtipi === 'Görev'
										? 'warning'
										: 'info'
								}
							/>
						</div>
					)}
					filter
					sortable
					filterMatchMode={FilterMatchMode.EQUALS}
					showFilterMatchModes={false}
					filterElement={bildirimTipiFilterTemplate}
					style={{
						minWidth: '5rem',
						width: '10rem',
						maxWidth: '15rem',
					}}
				/>

				<Column
					field='todolistYaratmaTarih'
					header='Oluşturulma Tarihi'
					body={(task: Task) => (
						<div
							style={{
								minHeight: '5vh',
								height: '5vh',
								maxHeight: '10vh',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{formatDate(task.todolistYaratmaTarih)}
						</div>
					)}
					style={{
						minWidth: '10rem',
						width: '13rem',
						maxWidth: '20rem',
					}}
					filter
					filterMatchMode={FilterMatchMode.CUSTOM}
					showFilterMatchModes={false}
					sortable
					filterElement={yaratmaTarihFilterTemplate}
				/>

				<Column
					field='todolistTerminTarih'
					header='Termin Tarihi'
					body={(task) => (
						<div
							style={{
								minHeight: '5vh',
								height: '5vh',
								maxHeight: '10vh',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{task.todolistIscompleted
								? formatDate(task.todolistTerminTarih)
								: formatDatecomp(task.todolistTerminTarih)}
						</div>
					)}
					style={{
						minWidth: '10rem',
						width: '13rem',
						maxWidth: '20rem',
					}}
					filter
					filterMatchMode={FilterMatchMode.CUSTOM}
					filterElement={combinedFilterTemplate}
					showFilterMatchModes={false}
					sortable
				/>

				<Column
					field='todolistYaratanIsim'
					header='Oluşturan Kişi'
					body={(task: Task) => (
						<div
							style={{
								minHeight: '5vh',
								height: '5vh',
								maxHeight: '10vh',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{task.todolistYaratanIsim}
						</div>
					)}
					style={{
						minWidth: '10rem',
						width: '17rem',
						maxWidth: '20rem',
					}}
					filter
					filterMatchMode={FilterMatchMode.EQUALS} // or consider FilterMatchMode.CONTAINS if partial matches are needed
					filterElement={userNameFilterTemplate}
					showFilterMatchModes={false} // Show match modes if you want users to change filter behavior
					sortable
				/>

				<Column
					field='todolistPriority'
					header='Önem Seviyesi'
					body={(task: Task) => (
						<div
							style={{
								minHeight: '5vh',
								height: '5vh',
								maxHeight: '10vh',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{task.todolistPriority && (
								<img
									src={iconMap[task.todolistPriority]}
									alt={task.todolistPriority}
									style={{
										width: '20px',
										height: '20px',
										marginRight: '0.5rem',
										verticalAlign: 'middle',
									}}
								/>
							)}
							<span>{task.todolistPriority ?? 'Boş'}</span>
						</div>
					)}
					style={{
						minWidth: '4rem',
						width: '6rem',
						maxWidth: '8rem',
					}}
					filter
					filterMatchMode={FilterMatchMode.EQUALS}
					filterElement={priorityRowFilterTemplate}
					showFilterMatchModes={false}
					sortable
				/>

				<Column
					header=''
					body={(task: Task) => (
						<div
							style={{
								minHeight: '5vh',
								height: '5vh',
								maxHeight: '10vh',
								display: 'flex',
								alignItems: 'center',
								marginLeft: 'auto',
							}}
						>
							{task.todolistIseditable !== false ? (
								<>
									<Button
										type='button'
										icon='pi pi-ellipsis-v'
										rounded
										text
										className='z-3 ml-2'
										onClick={(e) =>
											props.toggleMenu(e, task)
										}
									></Button>
									<Menu
										model={props.menuItems}
										popup
									/>
								</>
							) : (
								<span className='button-placeholder'></span>
							)}
						</div>
					)}
					style={{
						minWidth: '3rem',
						width: '4rem',
						maxWidth: '10rem',
					}}
				/>
			</DataTable>
			{/* <Paginator
                first={props.first}
                rows={rows}
                totalRecords={props.todoList.length} // Or the actual total number of records
                rowsPerPageOptions={[10, 20, 30]} // Options for rows per page
                onPageChange={handlePageChange} // Your custom page change handler
            /> */}

			<Dialog
				header='Task Details'
				visible={visible}
				onHide={hideDialog}
				modal
				maximizable
				style={{ width: '50vw', height: '50vh', resize: 'none' }}
			>
				<p>{selectedTask ? selectedTask.todolistAciklama : ''}</p>
			</Dialog>

			{/* Confirm Dialog */}
			<Dialog
				header={
					<span
						style={{
							display: 'block',
							textAlign: 'center',
							fontSize: '1.5rem',
							fontWeight: 'bold',
							color: '#333',
						}}
					>
						{!isCompleted ? 'Tamamla' : 'Geri Al'}{' '}
						{/* Conditional header text */}
					</span>
				}
				visible={props.isConfirmDialogVisible}
				onHide={props.onCancelChange}
				modal
				resizable={false}
				className='confirm-dialog' // Add a class for custom styling
			>
				<div className='confirm-dialog-content'>
					<p
						style={{
							fontSize: '1.1rem',
							color: '#333',
							margin: '0',
						}}
					>
						{!isCompleted
							? 'Bu görevi tamamlamak istediğinizden emin misiniz?' // Text when completing a task
							: 'Bu görevi tamamlanmamış olarak işaretlemek istediğinizden emin misiniz?'}{' '}
					</p>
				</div>
				<div className='confirm-dialog-buttons'>
					<Button
						label='İptal'
						onClick={props.onCancelChange}
						className='cancel-button'
					/>
					<Button
						label={!isCompleted ? 'Tamamla' : 'Geri Al'} // Conditional button label
						onClick={props.onConfirmChange}
						className='confirm-button'
					/>
				</div>
			</Dialog>
		</div>
	);
};

export default ToDoList;
