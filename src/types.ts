export type TaskItem = {
	title: string;
	completed: boolean;
	subTasks?: {
		title: string;
		completed: boolean;
	}[]
};

export type MinifiedTaskItem = {
	t: string;
	c: boolean;
	s?: {
		t: string;
		c: boolean;
	}[]
}