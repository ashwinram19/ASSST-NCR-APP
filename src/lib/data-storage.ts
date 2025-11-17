export type SetupItem = {
  id: string;
  name: string;
};

const storageKeys = {
  departments: 'nc_car_departments',
  clauseIds: 'nc_car_clause_ids',
  iqrNumbers: 'nc_car_iqr_numbers',
  nonConformityTypes: 'nc_car_nonconformity_types',
};

const loadData = (key: string): SetupItem[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error loading data for key ${key}:`, e);
    return [];
  }
};

const saveData = (key: string, data: SetupItem[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving data for key ${key}:`, e);
  }
};

export const getDepartments = () => loadData(storageKeys.departments);
export const saveDepartments = (data: SetupItem[]) => saveData(storageKeys.departments, data);

export const getClauseIDs = () => loadData(storageKeys.clauseIds);
export const saveClauseIDs = (data: SetupItem[]) => saveData(storageKeys.clauseIds, data);

export const getIQRNumbers = () => loadData(storageKeys.iqrNumbers);
export const saveIQRNumbers = (data: SetupItem[]) => saveData(storageKeys.iqrNumbers, data);

export const getNonConformityTypes = () => loadData(storageKeys.nonConformityTypes);
export const saveNonConformityTypes = (data: SetupItem[]) => saveData(storageKeys.nonConformityTypes, data);