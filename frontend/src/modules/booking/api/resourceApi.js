import axios from "axios";

const API = "http://localhost:8080/api/resources";

const getResourceApiError = (err, fallbackMessage) => {
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  if (err.code === "ERR_NETWORK" || !err.response) {
    return "Resource service is not reachable. Restart the backend server and try again.";
  }

  return fallbackMessage;
};

export const getResources = async () => {
  try {
    const res = await axios.get(API);
    return res.data;
  } catch (err) {
    throw new Error(getResourceApiError(err, "Failed to fetch resources"));
  }
};

export const createResource = async (data) => {
  try {
    const res = await axios.post(API, data);
    return res.data;
  } catch (err) {
    throw new Error(getResourceApiError(err, "Failed to create resource"));
  }
};

export const updateResource = async (id, data) => {
  try {
    const res = await axios.put(`${API}/${id}`, data);
    return res.data;
  } catch (err) {
    throw new Error(getResourceApiError(err, "Failed to update resource"));
  }
};

export const deleteResource = async (id) => {
  try {
    await axios.delete(`${API}/${id}`);
  } catch (err) {
    throw new Error(getResourceApiError(err, "Failed to delete resource"));
  }
};
