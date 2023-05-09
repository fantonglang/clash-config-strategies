exports = module.exports = function(proxy) {
  const tags = []
  const {name} = proxy
  const mat = /^(?<level>V\d+)/.exec(name)
  if (mat) {
    const {groups: {level}} = mat
    tags.push(`juzi-${level}`)
  }
  tag_for(name, '香港', tags)
  tag_for(name, '台湾', tags)
  tag_for(name, '新加坡', tags)
  tag_for(name, '美国', tags)
  tag_for(name, '日本', tags)
  return tags
}

function tag_for(name, place, tags) {
  if (name.indexOf(place) >= 0) {
    tags.push(`PLACE-${place}`)
  }
}