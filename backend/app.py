from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Define globally accessible recently_used variable for LRU and Optimal
recently_used = {}

def simulate_with_tlb(ref_string, frames, algorithm_func):
    global recently_used  # For LRU and Optimal

    memory = []
    tlb = []
    tlb_size = 3
    page_faults = 0
    tlb_hits = 0
    result = []

    for i, page in enumerate(ref_string):
        status = "No Fault"
        evicted = None
        added = None
        tlb_status = "TLB Miss"

        # Check TLB first
        if page in tlb:
            tlb_hits += 1
            tlb_status = "TLB Hit"
            status = "No Fault"
        else:
            # Not in TLB → check memory
            if page not in memory:
                page_faults += 1
                status = "Page Fault"
                if len(memory) == frames:
                    # Evict page according to algorithm
                    if algorithm_func == fifo:
                        evicted = memory.pop(0)
                    elif algorithm_func == lru:
                        lru_page = min(recently_used, key=recently_used.get)
                        memory.remove(lru_page)
                        evicted = lru_page
                        recently_used.pop(lru_page)
                    elif algorithm_func == optimal:
                        future_uses = {}
                        for m_page in memory:
                            if m_page in ref_string[i + 1:]:
                                future_uses[m_page] = ref_string[i + 1:].index(m_page)
                            else:
                                future_uses[m_page] = float('inf')
                        page_to_remove = max(future_uses, key=future_uses.get)
                        if page_to_remove in memory:
                            memory.remove(page_to_remove)
                            evicted = page_to_remove

                    # Remove evicted page from TLB if it exists
                    if evicted in tlb:
                        tlb.remove(evicted)

                memory.append(page)
                added = page  # New page added to memory

            # Add to TLB
            if page not in tlb:
                if len(tlb) == tlb_size:
                    tlb.pop(0)
                tlb.append(page)

            # Update LRU tracking
            recently_used[page] = i

        # Append step result
        result.append({
            "current_page": page,  # Always include current accessed page
            "memory": memory.copy(),
            "status": status,
            "evicted": evicted,
            "added": added if added else page,  # Always include added/present page
            "tlb_status": tlb_status,
            "tlb_contents": tlb.copy()
        })

    return {
        "page_faults": page_faults,
        "tlb_hits": tlb_hits,
        "memory_states": result
    }

def fifo(ref_string, frames):
    return simulate_with_tlb(ref_string, frames, fifo)

def lru(ref_string, frames):
    global recently_used
    recently_used = {}
    return simulate_with_tlb(ref_string, frames, lru)

def optimal(ref_string, frames):
    global recently_used
    recently_used = {}
    return simulate_with_tlb(ref_string, frames, optimal)

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.get_json()
    algorithm = data['algorithm']
    ref_string = data['reference_string']
    frames = data['frames']

    if algorithm == 'FIFO':
        result = fifo(ref_string, frames)
    elif algorithm == 'LRU':
        result = lru(ref_string, frames)
    elif algorithm == 'Optimal':
        result = optimal(ref_string, frames)
    else:
        return jsonify({'error': 'Invalid algorithm'}), 400

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
