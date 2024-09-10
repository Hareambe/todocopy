import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
	Task,
	TaskCreate,
	TaskGetModel,
	TaskGetModelComp,
	TaskUpdate,
} from '../models/TodolistModel';
import TodoService from '../service/TodolistService';
import ToDoList from '../components/TodoList/todolist';
import { MenuItem } from 'primereact/menuitem';
import { Menu } from 'primereact/menu';
import CreateTask from '../components/TodoList/CreateTask/CreateTask';
import DeleteTask from '../components/TodoList/DeleteTask/DeleteTask';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import EditTask from '../components/TodoList/EditTask/EditTask';
import { Button } from 'primereact/button';
import { UserService } from '../service/UserService';
import { RootState } from '../storage/store/rootReducer';
import { toggleCompleted } from '../storage/store/slices/completedSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
	increment,
	decrement,
	incrementByAmount,
} from '../storage/store/slices/countSlice';

import { Toast } from 'primereact/toast';

import { tr } from 'date-fns/locale';
import { DataTableFilterMeta } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

const ToDoPage: React.FC = () => {
	// Context and services
	// const { user, fetchUser } = useUser();
	const todoservice = new TodoService();
	const userservice = new UserService();
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	// Redux state selectors
	const programId = useSelector((state: RootState) => state.programid);
	const isCompleted = useSelector((state: RootState) => state.completed);
	const count = useSelector((state: RootState) => state.counter.value);

	// Local state for modals and task management
	const [showCreateTaskModal, setShowCreateTaskModal] =
		useState<boolean>(false);
	const [showEditTaskModal, setShowEditTaskModal] = useState<boolean>(false);
	const [showDeleteTaskModal, setShowDeleteTaskModal] =
		useState<boolean>(false);
	const [currentTask, setCurrentTask] = useState<Task | null>(null);
	const [programOptions, setProgramOptions] = useState<
		{ label: string; value: number }[]
	>([]);
	const [selectedOption, setSelectedOption] = useState<number>(100);
	const [prevselectedOption, setprevSelectedOption] = useState<number>(100);
	const [firstTable1, setFirstTable1] = useState<number>(0);
	const [firstTable2, setFirstTable2] = useState<number>(0);

	// Ref for menu
	const menu = useRef<Menu>(null);
	const toast = useRef<Toast>(null);

	// Fetch and set the user's programs
	async function fetchAndLogUserPrograms(userSicil: string) {
		try {
			const userPrograms = await userservice.getUserPrograms(userSicil);

			// Destructure generalPrograms and userProgramsArray, and ensure they're arrays.
			const {
				generalPrograms = [],
				userPrograms: userProgramsArray = [],
			} = userPrograms;

			// Predefined program options
			const predefinedPrograms = [{ label: 'Genel', value: -4 }];

			// Ensure generalPrograms and userProgramsArray are arrays before mapping
			const programMap: { label: string; value: number }[] = [
				...predefinedPrograms,
				...generalPrograms.map(
					(program: { programName: any; programId: string }) => ({
						label: program.programName,
						value: parseInt(program.programId),
					})
				),
				...userProgramsArray.map(
					(program: { programName: any; programId: string }) => ({
						label: program.programName,
						value: parseInt(program.programId),
					})
				),
			];

			setProgramOptions(programMap);
		} catch (error) {
			console.error('Error fetching user programs:', error);
		}
	}

	// Memoized user data to prevent unnecessary re-renders
	// const stableUser = useMemo(() => user, [user]);

	// Initial data fetch and program options setup
	useEffect(() => {
		fetchAndLogUserPrograms('1722');
		console.log(programOptions);
	}, []);

	// Refetch tasks when programId changes
	useEffect(() => {
		if (programId !== undefined) {
			queryClient.invalidateQueries(['tasks', programId]);
			refetch();
		}
		console.log(programId);
	}, [programId, queryClient]);

	const persNo = '1722';
	const name = 'Erdem Unal';
	// Helper function to create a TaskUpdate object from a Task object
	const createTaskUpdateFromTask = (task: Task): TaskUpdate => {
		return {
			ToDolistId: task.toDolistId,
			TodolistProgramId: task.todolistProgramId,
			TodolistAciklama: task.todolistAciklama,
			TodolistLink: task.todolistLink,
			TodolistSicil: task.todolistSicil,
			TodolistYaratmaTarih: task.todolistYaratmaTarih,
			TodolistIscompleted: task.todolistIscompleted ?? undefined,
			TodolistIsactive: task.todolistIsactive,
			TodolistYaratan: task.todolistYaratan ?? undefined,
			TodolistBildirimtipi: task.todolistBildirimtipi ?? undefined,
			TodolistIseditable: task.todolistIseditable,
			TodolistTerminTarih: task.todolistTerminTarih,
			TodolistAtanan: task.todolistAtanan,
			TodolistYaratanIsim: task.todolistYaratanIsim,
		};
	};

	// Fetch all tasks for the current user
	const fetchIncompleted = async (param?: number) => {
		// Construct the taskObject with persNo only
		const taskObject: { persNo: string; name: string; programId?: number } =
			{ persNo, name };
		// Conditionally add `programId` only if `param` is defined and not -5
		if (param !== undefined && param !== -5) {
			taskObject.programId = param;
		} else {
			return await todoservice.getIncompletedTasks(persNo, programId);
		}

		// Call the todoservice with the constructed taskObject
		return await todoservice.getIncompletedTasks(
			taskObject.persNo,
			taskObject.programId
		);
	};

	// Fetch tasks for a specific program
	const fetchCompleted = async (param: {
		persNo: string;
		name: string;
		programId?: number;
		count?: number;
	}) => {
		// Initialize the taskObject with the required persNo
		const taskObject: {
			persNo: string;
			programId?: number;
			count?: number;
		} = { persNo };

		// Conditionally add programId if it's provided
		if (param.programId !== undefined) {
			taskObject.programId = param.programId;
		}

		// Conditionally add count if it's provided
		if (param.count !== undefined) {
			taskObject.count = param.count;
		}

		return await todoservice.getCompletedTasks(
			taskObject.persNo,
			taskObject.programId,
			taskObject.count
		);
	};

	// Query to fetch incompleted tasks, refetch every 5 minutes
	const { data: tasks = [], isLoading } = useQuery(
		['tasks', programId],
		() => {
			// Initialize param as an empty object
			let param: { programId?: number } = {};

			// Only include `programId` in `param` if it's not -5
			if (programId !== -5) {
				param.programId = programId;
				// Call fetchIncompleted with the `programId`
				return fetchIncompleted(param.programId);
			} else {
				// Call fetchIncompleted without `programId`
				return fetchIncompleted();
			}
		},
		{
			refetchOnWindowFocus: false, // Prevents refetching when the window regains focus
			refetchOnReconnect: true,
			refetchOnMount: true,
			refetchInterval: 300000, // Polling every 5 min
		}
	);

	// Query to fetch completed tasks, refetch every 5 minutes
	const {
		data: ctasks = [],
		isLoading: isCtasksLoading,
		refetch,
	} = useQuery(
		['ctasks', selectedOption, programId],
		() => {
			let param: {
				persNo: string;
				name: string;
				programId?: number;
				count?: number;
			} = { persNo, name };

			// Conditionally add `programId` if it's not -5
			if (programId !== -5) {
				param.programId = programId;
			}

			// Conditionally add `count` if it's not -5
			if (selectedOption !== -5) {
				param.count = selectedOption;
			}

			// Call `fetchCompleted` with the constructed `param` object
			return fetchCompleted(param);
		},
		{
			refetchOnReconnect: true,
			refetchOnMount: true,
			enabled: false, // Disable automatic fetching
			keepPreviousData: true, // Keep the previous data until the new data is fetched
		}
	);

	const opts: number[] = [100, 500, 1000, -5]; // Array with -5 as the largest option

	useEffect(() => {
		const leng: number = ctasks.length;
		console.log(
			'leng',
			leng,
			'prev',
			prevselectedOption,
			'opt',
			selectedOption
		);

		// Get the indices of the selected and previous options in the array
		const selectedIndex = opts.indexOf(selectedOption);
		const prevSelectedIndex = opts.indexOf(prevselectedOption);
		console.log('prev', prevSelectedIndex, 'opt', selectedIndex);
		if (!(leng < prevselectedOption && selectedIndex > prevSelectedIndex)) {
			refetch(); // Manually trigger the query
		}
	}, [selectedOption, prevselectedOption]);

	// Mutation to delete a task
	const deleteTaskMutation = useMutation(todoservice.deactivateTask, {
		onSuccess: () => {
			toast.current?.show({
				severity: 'success',
				summary: 'Başarılı',
				detail: 'Görev başarıyla silindi',
				life: 3000,
			});
			dispatch(decrement());

			if (isCompleted) {
				refetch();
			} else {
				queryClient.invalidateQueries(['tasks', programId]);
			}
		},
		onError: (error) => {
			console.error('Görevi devre dışı bırakırken hata oluştu:', error);
			toast.current?.show({
				severity: 'error',
				summary: 'Hata',
				detail: 'Görev silinemedi',
				life: 3000,
			});
		},
	});

	// Mutation to edit a task
	const editTaskMutation = useMutation(todoservice.editTask, {
		onSuccess: () => {
			toast.current?.show({
				severity: 'success',
				summary: 'Başarılı',
				detail: 'Görev başarıyla düzenlendi',
				life: 3000,
			});
			if (isCompleted) {
				refetch();
			} else {
				queryClient.invalidateQueries(['tasks', programId]);
			}
		},
		onError: (error) => {
			console.error('Görevi düzenlerken hata oluştu:', error);
			toast.current?.show({
				severity: 'error',
				summary: 'Hata',
				detail: 'Görev düzenlenemedi',
				life: 3000,
			});
		},
	});
	// Mutation to edit change completionstate of task
	const completeTaskMutation = useMutation(todoservice.editTask, {
		onSuccess: () => {
			// Assuming you'll provide the condition
			if (!isCompleted) {
				toast.current?.show({
					severity: 'success',
					summary: 'Başarılı',
					detail: 'Görev tamamlandı',
					life: 3000,
				});

				dispatch(decrement());
			} else {
				toast.current?.show({
					severity: 'success',
					summary: 'Başarılı',
					detail: 'Görev tamamlanmamış olarak işaretlendi',
					life: 3000,
				});
				dispatch(increment());
			}
			queryClient.invalidateQueries(['tasks', programId]);
			refetch();
		},
		onError: (error) => {
			// Assuming you'll provide the condition
			if (!isCompleted) {
				console.error('Görevi tamamlarken hata oluştu:', error);
				toast.current?.show({
					severity: 'error',
					summary: 'Hata',
					detail: 'Görev tamamlanamadı',
					life: 3000,
				});
			} else {
				console.error('Görevi geri alırken hata oluştu:', error);
				toast.current?.show({
					severity: 'error',
					summary: 'Hata',
					detail: 'Görev geri alınamadı',
					life: 3000,
				});
			}
		},
	});

	// Mutation to create a task
	const createTaskMutation = useMutation(todoservice.createTask, {
		onSuccess: () => {
			toast.current?.show({
				severity: 'success',
				summary: 'Başarılı',
				detail: 'Görev başarıyla oluşturuldu',
				life: 3000,
			});
			queryClient.invalidateQueries(['tasks', programId]);
			toggleCreate();
			dispatch(increment());
		},
		onError: (error) => {
			console.error('Görev oluşturulurken hata oluştu:', error);
			toast.current?.show({
				severity: 'error',
				summary: 'Hata',
				detail: 'Görev oluşturma başarısız oldu',
				life: 3000,
			});
		},
	});

	// Confirm dialog visibility state
	const [isConfirmDialogVisible, setConfirmDialogVisible] = useState(false);

	// Handle checkbox change for task completion
	const handleCheckboxChange = (task: Task) => {
		setCurrentTask(task);
		setConfirmDialogVisible(true);
	};

	// Confirm task completion change
	const handleConfirmChange = () => {
		if (currentTask) {
			const update = createTaskUpdateFromTask(currentTask);
			update.TodolistIscompleted = !currentTask.todolistIscompleted;
			completeTaskMutation.mutate(update);
		}
		setConfirmDialogVisible(false);
	};

	// Cancel task completion change
	const handleCancelChange = () => {
		setCurrentTask(null);
		setConfirmDialogVisible(false);
	};

	// Toggle menu visibility
	const toggleMenu = (
		event: React.SyntheticEvent<Element, Event>,
		task: Task
	) => {
		setCurrentTask(task);
		menu.current?.toggle(event);
	};

	// Toggle delete modal
	const toggleDelete = () => {
		setShowDeleteTaskModal(!showDeleteTaskModal);
	};

	// Toggle create modal
	const toggleCreate = () => {
		setShowCreateTaskModal(!showCreateTaskModal);
	};

	// Toggle edit modal
	const toggleEdit = () => {
		setShowEditTaskModal(!showEditTaskModal);
	};

	// Handle task edit
	const handleEditTask = (task: TaskUpdate) => {
		editTaskMutation.mutate(task);
		toggleEdit();
	};

	// Handle task deletion
	const handleDeleteTask = (id: number) => {
		if (id) {
			deleteTaskMutation.mutate(id);
			toggleDelete();
		}
	};

	// Handle task creation
	const handleCreateTask = (task: TaskCreate) => {
		createTaskMutation.mutate(task);
	};

	// Toggle between completed and incomplete tasks
	const handleToggle = () => {
		dispatch(toggleCompleted());
	};

	// Define menu items
	const menuItems: MenuItem[] = [
		{ label: 'Düzenle', icon: 'pi pi-pencil', command: toggleEdit },
		{ label: 'Sil', icon: 'pi pi-trash', command: toggleDelete },
	];
	const [filters, setFilters] = useState<DataTableFilterMeta>({
		global: { value: null, matchMode: FilterMatchMode.CONTAINS },
		todolistAciklama: {
			operator: FilterOperator.AND,
			constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
		},
		todolistYaratanIsim: {
			value: null,
			matchMode: FilterMatchMode.STARTS_WITH,
		},
		todolistPriority: { value: null, matchMode: FilterMatchMode.EQUALS },
		todolistBildirimtipi: {
			value: null,
			matchMode: FilterMatchMode.EQUALS,
		},
		todolistTerminTarih: { value: null, matchMode: FilterMatchMode.CUSTOM },
		todolistYaratmaTarih: {
			value: null,
			matchMode: FilterMatchMode.CUSTOM,
		},
		todolistProgramId: { value: null, matchMode: FilterMatchMode.EQUALS },
	});
	// State for global filter value
	const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
	const o = true;

	// If tasks are loading, show a loading message
	if (isLoading || isCtasksLoading) {
		return <div>Görevler yükleniyor...</div>;
	}
	return (
		<div>
			<Toast ref={toast} />

			<>
				{isCompleted ? (
					<ToDoList
						title='Completed Tasks'
						todoList={ctasks}
						onCheckboxChange={handleCheckboxChange}
						onConfirmChange={handleConfirmChange}
						onCancelChange={handleCancelChange}
						toggleMenu={toggleMenu}
						menuItems={menuItems}
						createModal={toggleCreate}
						programOptions={programOptions}
						isConfirmDialogVisible={isConfirmDialogVisible}
						selectedOption={selectedOption}
						setSelectedOption={setSelectedOption}
						prevselectedOption={prevselectedOption}
						setprevSelectedOption={setprevSelectedOption}
						first={firstTable1}
						setFirst={setFirstTable1}
						setSecond={setFirstTable2}
						filters={filters}
						setFilters={setFilters}
						globalFilterValue={globalFilterValue}
						setGlobalFilterValue={setGlobalFilterValue}
					/>
				) : (
					<ToDoList
						title='Not Completed Tasks'
						todoList={tasks}
						onCheckboxChange={handleCheckboxChange}
						onConfirmChange={handleConfirmChange}
						onCancelChange={handleCancelChange}
						toggleMenu={toggleMenu}
						menuItems={menuItems}
						createModal={toggleCreate}
						programOptions={programOptions}
						isConfirmDialogVisible={isConfirmDialogVisible}
						selectedOption={selectedOption}
						setSelectedOption={setSelectedOption}
						prevselectedOption={prevselectedOption}
						setprevSelectedOption={setprevSelectedOption}
						first={firstTable2}
						setFirst={setFirstTable2}
						setSecond={setFirstTable1}
						filters={filters}
						setFilters={setFilters}
						globalFilterValue={globalFilterValue}
						setGlobalFilterValue={setGlobalFilterValue}
					/>
				)}
				<Menu
					ref={menu}
					model={menuItems}
					popup
				/>
				<CreateTask
					show={showCreateTaskModal}
					handleClose={toggleCreate}
					handleCreate={handleCreateTask}
					persNo={persNo}
					programOptions={programOptions}
					name={name}
				/>
				{currentTask && (
					<DeleteTask
						show={showDeleteTaskModal}
						handleClose={toggleDelete}
						handleDelete={handleDeleteTask}
						id={currentTask.toDolistId}
					/>
				)}
				{currentTask && (
					<EditTask
						show={showEditTaskModal}
						handleClose={toggleEdit}
						handleEdit={handleEditTask}
						currentTask={currentTask}
						programOptions={programOptions}
					/>
				)}
			</>
		</div>
	);
};

export default ToDoPage;
