exports = module.exports = function(proxy) {
  const tags = []
  const {name} = proxy
  if (name.indexOf('官网') >= 0 || name.indexOf('提示') >= 0) {
    return []
  }
  if (/^[^\d]+\d{2}$/.test(name)) {
    tags.push('cyanmori-V1')
  } else if (name.startsWith('定制')) {
    tags.push('cyanmori-V3')
  } else {
    tags.push('cyanmori-V2')
  }
  tag_for(name, '香港', tags)
  tag_for(name, '日本', tags)
  tag_for(name, '台湾', tags)
  tag_for(name, '新加坡', tags)
  tag_for(name, '美国', tags)
  tag_for(name, '印度', tags)
  tag_for(name, '韩国', tags)
  tag_for(name, '英国', tags)
  tag_for(name, '澳大利亚', tags)
  tag_for(name, '迪拜', tags)
  tag_for(name, '土耳其', tags)
  tag_for(name, '阿根廷', tags)
  return tags
}

function tag_for(name, place, tags) {
  if (name.indexOf(place) >= 0) {
    tags.push(`PLACE-${place}`)
  }
}