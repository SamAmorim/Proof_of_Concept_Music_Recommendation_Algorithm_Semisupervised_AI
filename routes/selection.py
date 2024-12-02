from flask import Blueprint, render_template

selection_bp = Blueprint('selection', __name__, url_prefix='/selection')

@selection_bp.route('/', methods=['GET'])
def selction():
    return render_template('selection.html')