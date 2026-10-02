import bpy, bmesh, json, math, sys
from mathutils import Matrix
OUT=sys.argv[sys.argv.index("--")+1]
O=bpy.data.objects; sc=bpy.context.scene
rig=O["Dreamy • PERFORMANCE CONTROLS"]; ctrl=rig.pose.bones["CTRL_EMOTION"]
# neutral rest: no NLA, neutral controls, props at full size
for t in rig.animation_data.nla_tracks: t.mute=True
rig.animation_data.action=None
for k in list(ctrl.keys()):
    v=ctrl[k]
    if isinstance(v,(int,float)): ctrl[k]=0.0
ctrl["mouth_open"]=0.8; ctrl["smile"]=0.35
for b in rig.pose.bones: b.location=(0,0,0); b.rotation_euler=(0,0,0); b.rotation_quaternion=(1,0,0,0); b.scale=(1,1,1)
for p in [k for k in ctrl.keys() if k.startswith("prop_")]: ctrl[p]=1.0
sc.frame_set(1); bpy.context.view_layer.update()
web=bpy.data.collections.new("WEB_EXPORT"); sc.collection.children.link(web)
info={"nodes":[]}
def link(o): web.objects.link(o); info["nodes"].append(o.name)
# ---- body: subsurf only (no holes, no armature/lattice), decimated, + wave morphs via the wave lattice
body=O["Dreamy • cloud body"]
saved={m.name:m.show_viewport for m in body.modifiers}
for m in body.modifiers: m.show_viewport = (m.type=='SUBSURF')
bpy.context.view_layer.update(); dg=bpy.context.evaluated_depsgraph_get()
me=bpy.data.meshes.new_from_object(body.evaluated_get(dg)); me.name="WEB_body"
for m in body.modifiers: m.show_viewport=saved[m.name]
wb=bpy.data.objects.new("dreamy_body",me); wb.matrix_world=body.matrix_world.copy(); link(wb)
bpy.context.view_layer.objects.active=wb; wb.select_set(True)
dec=wb.modifiers.new("dec",'DECIMATE'); dec.ratio=min(1.0,26000/max(1,len(me.polygons)))
with bpy.context.temp_override(object=wb,active_object=wb): bpy.ops.object.modifier_apply(modifier="dec")
info["body_tris"]=sum(len(p.vertices)-2 for p in wb.data.polygons)
lat=O["LATTICE • wave puff"]
lm=wb.modifiers.new("wave",'LATTICE'); lm.object=lat
wb.shape_key_add(name="Basis",from_mix=False)
def capture(name,stub,wave):
    ctrl["stub"]=float(stub); ctrl["wave"]=float(wave); rig.update_tag(); sc.frame_set(1); bpy.context.view_layer.update()
    dg=bpy.context.evaluated_depsgraph_get(); ev=wb.evaluated_get(dg)
    co=[v.co.copy() for v in ev.data.vertices]
    return co
base=capture("b",0,0); s1=capture("s",1,0); up=capture("u",1,1); dn=capture("d",1,-1)
wb.modifiers.remove(lm)
for nm,arr,ref in (("stub",s1,base),("wave_up",up,s1),("wave_down",dn,s1)):
    k=wb.shape_key_add(name=nm,from_mix=False)
    for i,v in enumerate(k.data): v.co=wb.data.vertices[i].co+(arr[i]-ref[i])
ctrl["stub"]=0.0; ctrl["wave"]=0.0
# ---- face meshes: copy data with shape keys; rest world matrix
face_names=[o.name for o in bpy.data.collections["01 DREAMY • refined character"].objects if o.type=='MESH' and (o.name.startswith(("Eye ","Mouth •")))]
for n in face_names:
    src=O[n]; d=src.data.copy(); o=bpy.data.objects.new(n.replace(" • ","_").replace(" ","_"),d); o.matrix_world=src.matrix_world.copy(); link(o)
# ---- props: evaluated geometry at full size, world placement
for src in bpy.data.collections["04 PROPS"].objects:
    dg=bpy.context.evaluated_depsgraph_get(); ev=src.evaluated_get(dg)
    me=bpy.data.meshes.new_from_object(ev); o=bpy.data.objects.new(src.name.replace(" • ","_").replace(" ","_"),me)
    o.matrix_world=ev.matrix_world.copy(); link(o)
    tris=sum(len(pp.vertices)-2 for pp in me.polygons)
    if tris>6000:
        bpy.context.view_layer.objects.active=o
        dm=o.modifiers.new("dec",'DECIMATE'); dm.ratio=6000/tris
        with bpy.context.temp_override(object=o,active_object=o): bpy.ops.object.modifier_apply(modifier="dec")
    if not me.materials and src.data and hasattr(src.data,'materials') and src.data.materials: me.materials.append(src.data.materials[0])
# ---- bake galaxy iris colour to texture (per eye)
sc.render.engine='CYCLES'; sc.cycles.samples=16; sc.cycles.device='CPU'
for side in ("L","R"):
    o=O[f"WEB_dummy"] if False else [x for x in web.objects if x.name==f"Eye_{side}_galaxy_iris"][0]
    m=o.data.materials[0].copy(); o.data.materials[0]=m; nt=m.node_tree
    p=nt.nodes["Principled BSDF"]; out=[n for n in nt.nodes if n.bl_idname=='ShaderNodeOutputMaterial'][0]
    src_sock=p.inputs["Base Color"].links[0].from_socket if p.inputs["Base Color"].is_linked else None
    em=nt.nodes.new("ShaderNodeEmission")
    if src_sock: nt.links.new(src_sock,em.inputs["Color"])
    else: em.inputs["Color"].default_value=p.inputs["Base Color"].default_value
    nt.links.new(em.outputs[0],out.inputs[0])
    img=bpy.data.images.new(f"iris_{side}",1024,1024); tn=nt.nodes.new("ShaderNodeTexImage"); tn.image=img
    for n in nt.nodes: n.select=False
    tn.select=True; nt.nodes.active=tn
    for x in bpy.context.view_layer.objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active=o
    bpy.ops.object.bake(type='EMIT',margin=8)
    img.filepath_raw=f"{OUT}/iris_{side}.png"; img.file_format='PNG'; img.save()
    info[f"iris_{side}"]="baked" if src_sock else "flat"
# ---- export
for x in bpy.context.view_layer.objects: x.select_set(False)
for o in web.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=f"{OUT}/dreamy.glb",use_selection=True,export_format='GLB',export_morph=True,export_morph_normal=False,
    export_apply=False,export_yup=True,export_materials='EXPORT',export_animations=False,export_skins=False,export_draco_mesh_compression_enable=False)
info["face"]=face_names
json.dump(info,open(f"{OUT}/export-info.json","w"),indent=1)
print("DONE")
