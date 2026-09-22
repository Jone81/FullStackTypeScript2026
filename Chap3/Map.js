const employees = [
    { name: "tim", id: 1 },
    { name: "cindy", id: 2 },
    { name: "rob", id: 3 },
]
console.log(employees.map(employee => {
    return `<div>${employee.name}- ${employee.id}</div>`;
}));