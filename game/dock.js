export function createDock(art){
 const root=art.prototypes.dock.clone(true);
 // Recipe asset is grounded; the showroom floor sits just below the water plane.
 root.children.forEach(o=>o.position.y-=.6);root.visible=false;return root;
}
