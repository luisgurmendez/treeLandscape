class CreateTrees < ActiveRecord::Migration
  def change
    create_table :trees do |t|
      t.string :name
      t.string :ownerName
      t.string :ownerLastname
      t.integer :x
      t.integer :y

      t.timestamps null: false
    end
  end
end
