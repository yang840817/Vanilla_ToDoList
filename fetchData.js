const readToken =
  "patXBapXYtxYEuyM0.bf0cdbf03cda3f27a110b8667ccb87bcee89bb0d116589618f48d3d467f1d5c9";
export async function fetchData() {
  return await axios
    .get(`https://api.airtable.com/v0/app132wuTOeUxBIZs/ToDoList`, {
      headers: {
        Authorization: `Bearer ${readToken}`,
      },
    })
    .then((res) => {
      if (res.status === 200)
        return res.data.records.sort(
          (a, b) => a.fields.created - b.fields.created
        );
    });
}

export async function createData(jsonData) {
  return await axios
    .post(`https://api.airtable.com/v0/app132wuTOeUxBIZs/ToDoList`, jsonData, {
      headers: {
        Authorization: `Bearer ${readToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      if (res.status === 200) return res;
    });
}
export async function updateData(jsonData) {
  return await axios
    .patch(`https://api.airtable.com/v0/app132wuTOeUxBIZs/ToDoList`, jsonData, {
      headers: {
        Authorization: `Bearer ${readToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      if (res.status === 200) return res;
    });
}
