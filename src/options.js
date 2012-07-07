var current = localStorage["provider"];
var select = document.createElement("select");
for(var i = 0; i < providers.length; i++)
{
  var option = document.createElement("option");
  option.value = i;
  if( current && current == i )
    option.selected = true;
  option.appendChild(document.createTextNode(providers[i]["name"]));
  select.appendChild(option); 
}
select.addEventListener('change',function (e) {
  localStorage["provider"] = e.target.value;
},true);
document.forms[0].appendChild(select);
