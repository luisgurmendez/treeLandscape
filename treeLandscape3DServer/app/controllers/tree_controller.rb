class TreeController < ApplicationController

  skip_before_filter :verify_authenticity_token

  def new
    tree= Tree.new(tree_params)
    respond_to do |format|
      if tree.save
        format.json{render json: {:data => tree.as_json()}}
      else
        format.json { render json: tree.errors, status: :unprocessable_entity }
      end
    end

  end

  def get_all
    trees = Tree.all
    render json: {:data => trees.as_json()}

  end



  def filter
    query = "%#{params[:query]}%"
    puts query
    trees = Tree.where("name LIKE ? OR ownerName LIKE ? OR ownerLastname LIKE  ?",query,query,query).order('ownerLastname')
    puts trees.as_json
    render json: {:data => trees.as_json()}
  end



# Never trust parameters from the scary internet, only allow the white list through.
  def tree_params
    params.require(:tree).permit(:x,:y,:ownerLastname,:ownerName,:name)
  end


end

