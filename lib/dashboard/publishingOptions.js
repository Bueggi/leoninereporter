export const publishingOptions = [
    {title: 'OFFER', description: 'Dieses Angebot ist noch nicht abgeschlossen', color:'orange'},
    {title: 'INBOUND', description: 'Dieses Angebot wurde über das Konaktformular eingefügt', color:'red'},
    { title: 'SOLD', description: 'Das Angebot wurde akzeptiert', current: true, color:'teal' },
    { title: 'RUNNING', description: 'Die Kampagne wird aktuell ausgeliefert', current: true, color:'ember' },
    { title: 'COMPLETED', description: 'Die Kampagne ist beendet und reported', current: true,color:'indigo' },
  ]
  
export const getColor = (area, status, intensity) => {
  const state = publishingOptions.filter(el => el.title === status)
  console.log('color', status, state)
  return area + '-' + state[0].color + '-' + intensity
}