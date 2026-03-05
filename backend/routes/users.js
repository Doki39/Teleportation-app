import express from "express"
import { usersdata } from "../data/user.js"
const router = express.Router()



router.get("/", (req, res) => {
    let result = [...usersdata]; 

    const filters = ['name', 'last_name', 'email', 'phone_number'];
    filters.forEach(field => {
        if (req.query[field]) {
            result = result.filter(u => u[field] === req.query[field]);
        }
    });

    if (result.length === 0) {
        return res.status(404).json({ message: "No users found" });
    }

    res.json(result);
});



router.get('/:id', (req,res) => {

    const id = Number(req.params.id);
    const user = usersdata.find(f => f.id === id);

    if(user.length === 0){
        res.status(404).send("Nepostojeci id");
    }

    res.json(user);

})

router.patch('/:id', (req, res) => {
  const updateUser = usersdata.find(u => u.id === Number(req.params.id));
  
  if (!updateUser) {
    return res.status(404).send("User not found");
  }

  if (req.body.id) {
    return res.status(400).send("Ne smijete mijenjati id");
  }

  const allowedFields = ['name', 'last_name', 'organisation', 'email', 'phone_number'];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateUser[field] = req.body[field];
    }
  });

  res.json(updateUser);
});

router.delete('/:id', (req,res) => {
    const index = usersdata.findIndex(f => f.id === Number(req.params.id));

    if (index === -1){
        res.status(404).json({ message: "User does not exist"});
    }

    usersdata.splice(index,1)

    res.json({
        message: "User deleted"
    })
})



export default router