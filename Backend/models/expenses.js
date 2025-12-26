const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
    expense_branch_id : { type: String, unique: true },
    expense_id : { type: String, required: true },
    expense_description : { type: String },
    expense_amount : { type: Number },
    expense_created_at : { type: Date }
},{timestamps:true})

module.exports = mongoose.model('expenses', expensesSchema)

