-- Apply in Supabase SQL Editor to update only these three existing products.
update public.products
set image_url = case slug
  when 'cloudline-mesh' then 'https://i.pinimg.com/736x/e1/4e/18/e14e18f0a78fdf4b41a4be77512a726f.jpg'
  when 'field-note-07' then 'https://i.pinimg.com/1200x/f3/0b/ea/f30bea54a14c7f7ae7c633db8dc847fc.jpg'
  when 'terrain-low' then 'https://images.unsplash.com/photo-1684918725924-ab55e49de549?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D'
  when 'velocity-runner' then 'https://images.unsplash.com/photo-1696954895451-701b481056d8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D'
  when 'ridge-survey' then 'https://images.unsplash.com/photo-1718953323604-511b38655942?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D'
  else image_url
end
where slug in ('cloudline-mesh', 'field-note-07', 'terrain-low', 'velocity-runner', 'ridge-survey');
