interface Instance {
  name: string
  weight: number
  data: number[]
}

function localUpdate(instance: Instance) {
  const lr = 0.01
  const gradient = instance.data.reduce((sum, v) => sum + (instance.weight * v - v), 0) / instance.data.length
  instance.weight -= lr * gradient
}

export async function runFederatedLearning() {
  const instances: Instance[] = [
    { name: 'A', weight: 0, data: [1, 2, 3, 4] },
    { name: 'B', weight: 0, data: [2, 3, 4, 5] },
    { name: 'C', weight: 0, data: [3, 4, 5, 6] }
  ]

  for (let round = 0; round < 5; round++) {
    for (const inst of instances) {
      localUpdate(inst)
    }
    const avgWeight = instances.reduce((sum, i) => sum + i.weight, 0) / instances.length
    for (const inst of instances) {
      inst.weight = avgWeight
    }
  }

  return instances.map(i => ({ name: i.name, weight: i.weight }))
}
