exports = module.exports = function(proxy) {
  const tags = []
  const {name} = proxy
  tag_for(name, tags)
  tags.push('dog')
  return tags
}

var translations = {
  'Hong Kong': '香港',
  'Taiwan': '台湾',
  'Singapore': '新加坡',
  'Japan': '日本',
  'United States': '美国',
  'South Korea': '韩国',
  'Canada': '加拿大',
  'Great Britain': '英国',
  'Turkey': '土耳其',
  'Netherlands': '荷兰',
  'France': '法国',
  'Germany': '德国',
  'Vietnam': '越南',
}

function tag_for(name, tags) {
  var idx = Object.keys(translations).find(p => name.indexOf(p) >= 0)
  if (idx) {
    tags.push(`PLACE-${translations[idx]}`)
    return;
  }
  Object.values(translations).forEach(p => {
    if (name.indexOf(p) >= 0) {
      tags.push(`PLACE-${p}`)
    }
  })
}