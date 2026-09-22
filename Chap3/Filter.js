const items = [
    { name: "jon", age: 20 },
    { name: "linda", age: 22 },
    { name: "jon", age: 40 }
];
const filteredItems = items.filter(item => item.name === "jon");
console.log(filteredItems);