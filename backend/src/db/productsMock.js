// Mock products database
const products = [
  { id: 'p1', title: 'Peça', price: 10.0 },
  { id: 'p2', title: 'Peça', price: 15.0 },
  { id: 'p3', title: 'Peça', price: 20.0 },
  { id: 'p4', title: 'Peça', price: 25.0 },
  { id: 'p5', title: 'Peça', price: 30.0 },
  { id: 'p6', title: 'Peça', price: 35.0 },
  { id: 'p7', title: 'Peça', price: 40.0 },
  { id: 'p8', title: 'Peça', price: 45.0 },
  { id: 'p9', title: 'Peça', price: 55.0 },
  { id: 'p10', title: 'Peça', price: 65.0 },
  { id: 'p11', title: 'Peça', price: 75.0 },
  { id: 'p12', title: 'Peça', price: 85.0 },
  { id: 'p13', title: 'Peça', price: 95.0 },
  { id: 'p14', title: 'Peça', price: 125.0 },
  { id: 'p15', title: 'Peça', price: 135.0 },
  { id: 'p16', title: 'Peça', price: 145.0 },
  { id: 'p17', title: 'Peça', price: 155.0 }
]

module.exports = {
  findAll: async () => {
    await new Promise(r => setTimeout(r, 50))
    return products.slice()
  }
}
